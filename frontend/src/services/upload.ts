import api from "@/lib/api";

export async function uploadDataset(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  return api.post("/datasets/upload", formData);
}



