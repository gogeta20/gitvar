use gitmap_backend::infrastructure::filesystem::FsDirectoryBrowser;
use gitmap_backend::infrastructure::git::GitCliBranchReader;
use gitmap_backend::infrastructure::git::GitCliCommitFilesReader;
use gitmap_backend::infrastructure::git::GitCliCommitReader;
use gitmap_backend::infrastructure::git::GitCliFileDiffReader;
use gitmap_backend::infrastructure::git::GitCliStashReader;
use gitmap_backend::infrastructure::git::GitCliStatusReader;
use gitmap_backend::presentation::http::serve;

fn spawn_backend_server() {
  std::thread::spawn(|| {
    let branch_reader = GitCliBranchReader::new();
    let commit_reader = GitCliCommitReader::new();
    let status_reader = GitCliStatusReader::new();
    let commit_files_reader = GitCliCommitFilesReader::new();
    let file_diff_reader = GitCliFileDiffReader::new();
    let stash_reader = GitCliStashReader::new();
    let directory_browser = FsDirectoryBrowser::new();

    if let Err(error) = serve(
      &branch_reader,
      &commit_reader,
      &status_reader,
      &commit_files_reader,
      &file_diff_reader,
      &stash_reader,
      &directory_browser,
    ) {
      eprintln!("GitMap backend stopped: {error}");
    }
  });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  spawn_backend_server();

  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
