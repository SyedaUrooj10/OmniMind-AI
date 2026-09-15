import api from "./api";

export async function login(
  email: string,
  password: string
) {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  return api.post(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  );
}

export async function register(
  name: string,
  email: string,
  password: string
) {
  return api.post("/auth/register", {
    name,
    email,
    password,
  });
}


