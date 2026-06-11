const authForms = document.getElementById("authForms");
const showSignInButton = document.getElementById("showSignIn");
const showSignUpButton = document.getElementById("showSignUp");

const authState = {
  mode: "signin"
};

function renderAuthForms() {
  authForms.innerHTML = authState.mode === "signin" ? `
    <form class="stack auth-form" id="signinForm">
      <div class="form-grid">
        <label>Email <input name="email" type="email" required /></label>
        <label>Password <input name="password" type="password" required /></label>
      </div>
      <button class="button primary" type="submit">Sign in</button>
      <div class="oauth-divider"><span>or continue with</span></div>
      <a class="button google-button" href="/api/auth/google">Continue with Google</a>
      <p class="muted" id="authMessage"></p>
    </form>
  ` : `
    <form class="stack auth-form" id="signupForm">
      <div class="form-grid">
        <label>Name <input name="name" required /></label>
        <label>Email <input name="email" type="email" required /></label>
        <label>Password <input name="password" type="password" required /></label>
        <label>Phone <input name="phone" /></label>
      </div>
      <button class="button primary" type="submit">Create account</button>
      <div class="oauth-divider"><span>or continue with</span></div>
      <a class="button google-button" href="/api/auth/google">Sign up with Google</a>
      <p class="muted" id="authMessage"></p>
    </form>
  `;

  bindAuthForm();
}

async function authRequest(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();
  const data = contentType.includes("application/json")
    ? JSON.parse(rawBody)
    : { message: rawBody.slice(0, 180) || "Authentication failed" };

  if (!response.ok) {
    throw new Error(data.message || "Authentication failed");
  }

  return data;
}

function bindAuthForm() {
  const authMessage = document.getElementById("authMessage");
  const signinForm = document.getElementById("signinForm");
  const signupForm = document.getElementById("signupForm");

  if (signinForm) {
    signinForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        authMessage.textContent = "Signing in...";
        const formData = new FormData(signinForm);
        const data = await authRequest("/api/auth/signin", {
          email: formData.get("email"),
          password: formData.get("password")
        });
        window.location.href = data.account.role === "admin" ? "/admin" : "/shop";
      } catch (error) {
        authMessage.textContent = error.message;
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        authMessage.textContent = "Creating account...";
        const formData = new FormData(signupForm);
        const data = await authRequest("/api/auth/signup", {
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          phone: formData.get("phone")
        });
        window.location.href = data.account.role === "admin" ? "/admin" : "/shop";
      } catch (error) {
        authMessage.textContent = error.message;
      }
    });
  }
}

showSignInButton.addEventListener("click", () => {
  authState.mode = "signin";
  renderAuthForms();
});

showSignUpButton.addEventListener("click", () => {
  authState.mode = "signup";
  renderAuthForms();
});

renderAuthForms();
