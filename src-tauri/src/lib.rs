use serde::Serialize;

#[derive(Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
enum PackageKind {
    MacDmg,
    MacPkg,
    LinuxAppImage,
    LinuxDeb,
    LinuxRpm,
    Archive,
    Unknown,
}

fn classify_release_asset(name: &str) -> PackageKind {
    let name = name.to_ascii_lowercase();

    if name.ends_with(".dmg") {
        PackageKind::MacDmg
    } else if name.ends_with(".pkg") {
        PackageKind::MacPkg
    } else if name.ends_with(".appimage") {
        PackageKind::LinuxAppImage
    } else if name.ends_with(".deb") {
        PackageKind::LinuxDeb
    } else if name.ends_with(".rpm") {
        PackageKind::LinuxRpm
    } else if [".zip", ".tar.gz", ".tar.xz", ".tar.bz2", ".tgz"]
        .iter()
        .any(|extension| name.ends_with(extension))
    {
        PackageKind::Archive
    } else {
        PackageKind::Unknown
    }
}

#[tauri::command]
fn classify_asset(name: &str) -> PackageKind {
    classify_release_asset(name)
}

#[cfg(test)]
mod tests {
    use super::{classify_release_asset, PackageKind};

    #[test]
    fn classifies_supported_desktop_release_assets() {
        assert_eq!(
            classify_release_asset("Release-arm64.dmg"),
            PackageKind::MacDmg
        );
        assert_eq!(classify_release_asset("installer.pkg"), PackageKind::MacPkg);
        assert_eq!(
            classify_release_asset("tool-x86_64.AppImage"),
            PackageKind::LinuxAppImage
        );
        assert_eq!(
            classify_release_asset("tool_1.2.0_amd64.deb"),
            PackageKind::LinuxDeb
        );
        assert_eq!(
            classify_release_asset("tool-1.2.0.x86_64.rpm"),
            PackageKind::LinuxRpm
        );
        assert_eq!(classify_release_asset("tool.tar.gz"), PackageKind::Archive);
        assert_eq!(classify_release_asset("source.zip"), PackageKind::Archive);
        assert_eq!(
            classify_release_asset("checksums.txt"),
            PackageKind::Unknown
        );
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![classify_asset])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
