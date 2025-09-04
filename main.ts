import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
  ItemView,
  Notice,
  TFile,
  Modal,
  Menu,
} from "obsidian";
import { createRoot, Root } from "react-dom/client";
import React from "react";
import { CalendarView } from "./components/calendar-view";
import { ReviewNotification } from "./components/review-notification";
import { AddNoteModal } from "./components/add-note-modal";
import { ReviewStateProvider } from "./context/review-context";
import { SpacedRepetitionManager } from "./utils/spaced-repetition-manager";
import { PluginSettings } from "./types";

const DEFAULT_SETTINGS: PluginSettings = {
  notificationEnabled: true,
  defaultInterval: 1,
  maxNotesPerDay: 20,
  reviewHotkey: "Ctrl+Shift+R",
  dataFilePath:
    ".obsidian/plugins/spaced-repetition/data.json",
};

export default class SpacedRepetitionPlugin extends Plugin {
  settings: PluginSettings;
  manager: SpacedRepetitionManager;
  private notificationRoot: Root | null = null;
  private statusBarItem: HTMLElement | null = null;

  async onload() {
    await this.loadSettings();
    this.manager = new SpacedRepetitionManager(this.app, this.settings, this);

    // Listen for data changes
    this.manager.on('dataChanged', () => {
      this.refreshAllReviewViews();
      this.checkAndShowNotification();
    });

    // Register views
    this.registerView(
      "review-calendar-view",
      (leaf) => new ReviewView(leaf, this.manager, "calendar")
    );


    // Add ribbon icon
    this.addRibbonIcon("brain", "Spaced Repetition Reviews", () => {
      this.activateView("calendar");
    });

    // Add command to open review calendar
    this.addCommand({
      id: "open-review-calendar",
      name: "Open review calendar",
      callback: () => this.activateView("calendar"),
    });


    // Add command to add current note to review
    this.addCommand({
      id: "add-current-note-to-review",
      name: "Add current note to spaced repetition",
      hotkeys: [{ modifiers: ["Ctrl", "Shift"], key: "R" }],
      callback: () => this.addCurrentNoteToReview(),
    });

    // Add status bar item
    this.statusBarItem = this.addStatusBarItem();
    this.updateStatusBar();

    // Settings tab
    this.addSettingTab(new SpacedRepetitionSettingTab(this.app, this));

    // Show notification on startup
    if (this.settings.notificationEnabled) {
      setTimeout(() => this.showReviewNotification(), 2000);
    }

    // Register event to update status bar when active file changes
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.updateStatusBar();
        // Hide review buttons when switching to a different note
        this.hideReviewButtons();
      })
    );

    // Register context menu
    this.registerEvent(
        this.app.workspace.on('file-menu', (menu: Menu, file: TFile) => {
            if (file instanceof TFile) {
                menu.addItem((item) => {
                    item.setTitle('Add to Spaced Repetition')
                        .setIcon('brain')
                        .onClick(() => this.addNoteToReview(file));
                });
            }
        })
    );
  }

  onunload() {
    if (this.notificationRoot) {
      this.notificationRoot.unmount();
    }
    this.hideReviewButtons();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateView(viewType: "calendar") {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType("review-calendar-view");

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({
        type: "review-calendar-view",
        active: true,
      });
    }

    workspace.revealLeaf(leaf);
  }

  async showReviewNotification() {
    const notesToReview = await this.manager.getNotesToReview();
    if (notesToReview.length === 0) return;

    // Create notification container if it doesn't exist
    let container = document.getElementById("sr-notification-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "sr-notification-container";
      
      // Responsive positioning for mobile and desktop
      const isMobile = this.app.isMobile;
      const notificationStyles = isMobile ? 
        "position: fixed; top: 10px; left: 10px; right: 10px; z-index: 1000; max-width: calc(100vw - 20px);" :
        "position: fixed; top: 20px; right: 20px; z-index: 1000;";
      
      container.style.cssText = notificationStyles;
      document.body.appendChild(container);
    }

    if (this.notificationRoot) {
      this.notificationRoot.unmount();
    }

    this.notificationRoot = createRoot(container);
    this.notificationRoot.render(
      React.createElement(ReviewNotification, {
        count: notesToReview.length,
        onClose: () => {
          if (this.notificationRoot) {
            this.notificationRoot.unmount();
            this.notificationRoot = null;
          }
        },
        onClick: () => {
          // Close notification and open review list
          if (this.notificationRoot) {
            this.notificationRoot.unmount();
            this.notificationRoot = null;
          }
          // Open the review calendar view instead of individual note
          this.activateView("calendar");
        },
      })
    );
  }

  async addCurrentNoteToReview() {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice("No active file");
      return;
    }

    await this.addNoteToReview(activeFile);
  }

  async addNoteToReview(file: TFile) {
    new AddNoteModalImpl(this.app, file, this.manager).open();
  }

  private updateStatusBar() {
    if (!this.statusBarItem) return;

    const activeFile = this.app.workspace.getActiveFile();

    if (activeFile) {
      // Show status bar for all files
      this.statusBarItem.style.display = "block";
      this.statusBarItem.setText("📚 Add to Spaced Repetition");

      // Remove existing event listeners
      this.statusBarItem.removeEventListener("click", this.onStatusBarClick);

      // Add new event listener for adding current note
      this.statusBarItem.addEventListener("click", this.onStatusBarClick);
    } else {
      // Hide status bar when no file is active
      this.statusBarItem.style.display = "none";
    }
  }

  private onStatusBarClick = () => {
    this.addCurrentNoteToReview();
  };

  async openNoteForReview(note: any) {
    // Open the note file
    const file = this.app.vault.getFileByPath(note.filePath);
    if (file) {
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(file);

      // Add review buttons to the bottom after a short delay
      setTimeout(() => this.showReviewButtons(note), 100);
    }
  }

  private reviewButtonsContainer: HTMLElement | null = null;
  private reviewButtonsRoot: Root | null = null;
  private escapeKeyHandler: ((event: KeyboardEvent) => void) | null = null;

  private showReviewButtons(note: any) {
    // Remove existing review buttons
    this.hideReviewButtons();

    // Create review buttons container at the bottom
    this.reviewButtonsContainer = document.createElement("div");
    this.reviewButtonsContainer.id = "sr-review-buttons";
    
    // Responsive design for mobile and desktop
    const isMobile = this.app.isMobile;
    const containerStyles = isMobile ? `
            position: fixed;
            bottom: 10px;
            left: 10px;
            right: 10px;
            z-index: 1000;
            background: var(--background-primary);
            border: 1px solid var(--background-modifier-border);
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: calc(100vw - 20px);
        ` : `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            background: var(--background-primary);
            border: 1px solid var(--background-modifier-border);
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        `;
    
    this.reviewButtonsContainer.style.cssText = containerStyles;
    document.body.appendChild(this.reviewButtonsContainer);

    // Add escape key handler
    this.escapeKeyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.hideReviewButtons();
      }
    };
    document.addEventListener('keydown', this.escapeKeyHandler);

    // Render review buttons with responsive design
    this.reviewButtonsRoot = createRoot(this.reviewButtonsContainer);
    
    // Responsive button styling
    const buttonBaseStyle = {
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: isMobile ? "14px" : "13px",
      fontWeight: "500",
      minHeight: isMobile ? "44px" : "32px", // Touch target size for mobile
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: isMobile ? "1" : "0 0 auto",
      transition: "all 0.2s ease",
    };
    
    const containerStyle = {
      display: "flex",
      gap: isMobile ? "6px" : "8px",
      flexWrap: isMobile ? "wrap" : "nowrap",
      alignItems: "center",
    };
    
    const buttonPadding = isMobile ? "10px 12px" : "8px 16px";
    
    this.reviewButtonsRoot.render(
      React.createElement(
        "div",
        { style: containerStyle },
        [
          React.createElement(
            "button",
            {
              key: "again",
              style: {
                ...buttonBaseStyle,
                padding: buttonPadding,
                backgroundColor: "#fee2e2",
                color: "#dc2626",
              },
              onClick: () => this.reviewNote(note, "again"),
              onMouseEnter: (e) => {
                if (!isMobile) {
                  e.target.style.backgroundColor = "#fecaca";
                  e.target.style.transform = "translateY(-1px)";
                }
              },
              onMouseLeave: (e) => {
                if (!isMobile) {
                  e.target.style.backgroundColor = "#fee2e2";
                  e.target.style.transform = "translateY(0)";
                }
              },
            },
            "Again"
          ),
          React.createElement(
            "button",
            {
              key: "hard",
              style: {
                ...buttonBaseStyle,
                padding: buttonPadding,
                backgroundColor: "#fed7aa",
                color: "#ea580c",
              },
              onClick: () => this.reviewNote(note, "hard"),
              onMouseEnter: (e) => {
                if (!isMobile) {
                  e.target.style.backgroundColor = "#fdba74";
                  e.target.style.transform = "translateY(-1px)";
                }
              },
              onMouseLeave: (e) => {
                if (!isMobile) {
                  e.target.style.backgroundColor = "#fed7aa";
                  e.target.style.transform = "translateY(0)";
                }
              },
            },
            "Hard"
          ),
          React.createElement(
            "button",
            {
              key: "good",
              style: {
                ...buttonBaseStyle,
                padding: buttonPadding,
                backgroundColor: "#dcfce7",
                color: "#16a34a",
              },
              onClick: () => this.reviewNote(note, "good"),
              onMouseEnter: (e) => {
                if (!isMobile) {
                  e.target.style.backgroundColor = "#bbf7d0";
                  e.target.style.transform = "translateY(-1px)";
                }
              },
              onMouseLeave: (e) => {
                if (!isMobile) {
                  e.target.style.backgroundColor = "#dcfce7";
                  e.target.style.transform = "translateY(0)";
                }
              },
            },
            "Good"
          ),
          React.createElement(
            "button",
            {
              key: "easy",
              style: {
                ...buttonBaseStyle,
                padding: buttonPadding,
                backgroundColor: "#dbeafe",
                color: "#2563eb",
              },
              onClick: () => this.reviewNote(note, "easy"),
              onMouseEnter: (e) => {
                if (!isMobile) {
                  e.target.style.backgroundColor = "#bfdbfe";
                  e.target.style.transform = "translateY(-1px)";
                }
              },
              onMouseLeave: (e) => {
                if (!isMobile) {
                  e.target.style.backgroundColor = "#dbeafe";
                  e.target.style.transform = "translateY(0)";
                }
              },
            },
            "Easy"
          ),
          React.createElement(
            "div",
            {
              key: "separator",
              style: {
                width: "1px",
                height: isMobile ? "24px" : "20px",
                backgroundColor: "var(--background-modifier-border)",
                margin: isMobile ? "0 4px" : "0 6px",
              },
            }
          ),
          React.createElement(
            "button",
            {
              key: "close",
              style: {
                ...buttonBaseStyle,
                padding: isMobile ? "10px" : "8px 12px",
                fontSize: isMobile ? "18px" : "16px",
                fontWeight: "bold",
                backgroundColor: "var(--background-secondary)",
                color: "var(--text-muted)",
                minWidth: isMobile ? "44px" : "auto",
              },
              onClick: () => this.closeNoteAndButtons(note),
              title: "Close note and review buttons",
              onMouseEnter: (e) => {
                if (!isMobile) {
                  e.target.style.backgroundColor = "var(--background-modifier-hover)";
                  e.target.style.transform = "translateY(-1px)";
                }
              },
              onMouseLeave: (e) => {
                if (!isMobile) {
                  e.target.style.backgroundColor = "var(--background-secondary)";
                  e.target.style.transform = "translateY(0)";
                }
              },
            },
            "✕"
          ),
        ]
      )
    );
  }

  private hideReviewButtons() {
    if (this.reviewButtonsRoot) {
      this.reviewButtonsRoot.unmount();
      this.reviewButtonsRoot = null;
    }
    if (this.reviewButtonsContainer) {
      this.reviewButtonsContainer.remove();
      this.reviewButtonsContainer = null;
    }
    if (this.escapeKeyHandler) {
      document.removeEventListener('keydown', this.escapeKeyHandler);
      this.escapeKeyHandler = null;
    }
  }

  private closeNoteAndButtons(note: any) {
    // Hide the review buttons first
    this.hideReviewButtons();
    
    // Close the note tab
    const activeFile = this.app.workspace.getActiveFile();
    
    if (activeFile && activeFile.path === note.filePath) {
      // Find the leaf containing this specific file
      let targetLeaf: WorkspaceLeaf | null = null;
      this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
        const view = leaf.view as any;
        if (view.file && view.file.path === note.filePath) {
          targetLeaf = leaf;
        }
      });
      
      if (targetLeaf) {
        targetLeaf.detach();
      }
    }
  }

  private async reviewNote(
    note: any,
    difficulty: "again" | "hard" | "good" | "easy"
  ) {
    await this.manager.reviewNote(note.id, difficulty);
    this.hideReviewButtons();
    new Notice(`Note reviewed as ${difficulty}`);
    
    // Close the current note tab
    const activeFile = this.app.workspace.getActiveFile();
    
    if (activeFile && activeFile.path === note.filePath) {
      // Find the leaf containing this specific file
      let targetLeaf: WorkspaceLeaf | null = null;
      this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
        const view = leaf.view as any;
        if (view.file && view.file.path === note.filePath) {
          targetLeaf = leaf;
        }
      });
      
      if (targetLeaf) {
        targetLeaf.detach();
      }
    }
  }

  private refreshAllReviewViews() {
    // Find all review views and trigger refresh
    const reviewViews = this.app.workspace.getLeavesOfType("review-calendar-view");
    
    reviewViews.forEach(leaf => {
      const view = leaf.view as ReviewView;
      if (view && view.refreshData) {
        view.refreshData();
      }
    });
  }

  private async checkAndShowNotification() {
    if (!this.settings.notificationEnabled) return;
    
    const notesToReview = await this.manager.getNotesToReview();
    if (notesToReview.length > 0) {
      // Only show notification if there isn't one already
      if (!this.notificationRoot) {
        this.showReviewNotification();
      }
    }
  }

}

class ReviewView extends ItemView {
  private root: Root | null = null;
  private manager: SpacedRepetitionManager;

  constructor(
    leaf: WorkspaceLeaf,
    manager: SpacedRepetitionManager,
    viewType: "calendar"
  ) {
    super(leaf);
    this.manager = manager;
  }

  getViewType() {
    return "review-calendar-view";
  }

  getDisplayText() {
    return "Spaced Repetition Reviews";
  }

  getIcon() {
    return "list";
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();

    const reactContainer = container.createDiv();
    this.root = createRoot(reactContainer);

    this.root.render(
      React.createElement(ReviewStateProvider, {
        manager: this.manager,
        onOpenNote: (note: any) =>
          (this.manager as any).plugin.openNoteForReview(note),
        children: React.createElement(CalendarView),
      })
    );
  }

  refreshData() {
    // Force a re-render by recreating the view
    this.onOpen();
  }

  async onClose() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

class AddNoteModalImpl extends Modal {
  private root: Root | null = null;
  private file: TFile;
  private manager: SpacedRepetitionManager;

  constructor(app: App, file: TFile, manager: SpacedRepetitionManager) {
    super(app);
    this.file = file;
    this.manager = manager;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    // Check multiple possible dark mode indicators
    const isDarkMode = document.body.classList.contains('theme-dark') || 
                      document.body.classList.contains('dark') ||
                      document.documentElement.classList.contains('theme-dark') ||
                      document.documentElement.classList.contains('dark') ||
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isDarkMode) {
      contentEl.classList.add('dark');
    }

    // Also ensure the modal container itself has proper styling
    contentEl.style.cssText = `
      background: ${isDarkMode ? 'var(--background-primary)' : 'white'};
      color: ${isDarkMode ? 'var(--text-normal)' : 'black'};
    `;

    this.root = createRoot(contentEl);
    this.root.render(
      React.createElement(AddNoteModal, {
        noteTitle: this.file.basename,
        onAdd: async (interval: number) => {
          await this.manager.addNoteToReview(this.file, interval);
          new Notice(`Added "${this.file.basename}" to spaced repetition`);
          this.close();
        },
        onCancel: () => this.close(),
      })
    );
  }

  onClose() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

class SpacedRepetitionSettingTab extends PluginSettingTab {
  plugin: SpacedRepetitionPlugin;

  constructor(app: App, plugin: SpacedRepetitionPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Spaced Repetition Settings" });

    new Setting(containerEl)
      .setName("Show notifications")
      .setDesc("Show notification on startup when notes need review")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.notificationEnabled)
          .onChange(async (value) => {
            this.plugin.settings.notificationEnabled = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Default interval")
      .setDesc("Default interval in days for new notes")
      .addText((text) =>
        text
          .setPlaceholder("1")
          .setValue(String(this.plugin.settings.defaultInterval))
          .onChange(async (value) => {
            const num = parseInt(value);
            if (!isNaN(num) && num > 0) {
              this.plugin.settings.defaultInterval = num;
              await this.plugin.saveSettings();
            }
          })
      );

    new Setting(containerEl)
      .setName("Max notes per day")
      .setDesc("Maximum number of notes to review per day")
      .addText((text) =>
        text
          .setPlaceholder("20")
          .setValue(String(this.plugin.settings.maxNotesPerDay))
          .onChange(async (value) => {
            const num = parseInt(value);
            if (!isNaN(num) && num > 0) {
              this.plugin.settings.maxNotesPerDay = num;
              await this.plugin.saveSettings();
            }
          })
      );


    new Setting(containerEl)
      .setName("Data file path")
      .setDesc(
        "Path where spaced repetition data is stored (relative to vault root)"
      )
      .addText((text) =>
        text
          .setPlaceholder(".obsidian/plugins/spaced-repetition/data.json")
          .setValue(this.plugin.settings.dataFilePath)
          .onChange(async (value) => {
            this.plugin.settings.dataFilePath =
              value || ".obsidian/plugins/spaced-repetition/data.json";
            await this.plugin.saveSettings();
          })
      );
  }
}
