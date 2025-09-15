import sys

from PySide6.QtCore import Qt
from PySide6.QtGui import QAction
from PySide6.QtWidgets import QApplication, QMainWindow, QMessageBox


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("My Desktop App")
        self.resize(900, 600)

        self._create_actions()
        self._create_menus()

    def _create_actions(self) -> None:
        self.action_quit = QAction("Exit", self)
        self.action_quit.setShortcut("Ctrl+Q")
        self.action_quit.triggered.connect(self.close)

        self.action_about = QAction("About", self)
        self.action_about.triggered.connect(self.show_about_dialog)

    def _create_menus(self) -> None:
        menu_file = self.menuBar().addMenu("&File")
        menu_file.addAction(self.action_quit)

        menu_help = self.menuBar().addMenu("&Help")
        menu_help.addAction(self.action_about)

    def show_about_dialog(self) -> None:
        QMessageBox.about(
            self,
            "About",
            "My Desktop App\nPowered by PySide6",
        )


def main() -> int:
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())

