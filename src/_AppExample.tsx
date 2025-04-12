import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export default function AppExample() {
  const [files, setFiles] = useState<File[]>([]);
  const [presets, setPresets] = useState<{}>({});

  const handleOpenFiles = async (directory: boolean) => {
    const selected = await open({
      multiple: true,
      directory,
    });

    if (directory) {
      await invoke("parse", {
        paths: selected,
        ignorePatterns: [".git", ".gitignore"],
      });
    } else {
      await invoke("parse", {
        paths: selected,
        ignorePatterns: [".git", ".gitignore"],
      });
    }

    console.log("selected", selected);
  };

  useEffect(() => {
    invoke("get_presets").then((presets) => setPresets(JSON.parse(presets)));
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <button onClick={() => handleOpenFiles(false)}>Open Files</button>
      <button onClick={() => handleOpenFiles(true)}>Open Folder</button>
      {presets && <pre>{JSON.stringify(presets, null, 2)}</pre>}
    </div>
  );
}
