const kakaoLoginButton = document.querySelector("#kakao");
const naverLoginButton = document.querySelector("#naver");
const googleLoginButton = document.querySelector("#google");
const userImage = document.querySelector("img");
const userName = document.querySelector("#user_name");
const logoutButton = document.querySelector("#logout_button");

let currentOAuthService = "";

let kakaoClientId = "";
let naverClientId = "";
let naverSecret = "";
let naverClientSecret = "";
const redirectURI = "http://127.0.0.1:5500";
let kakaoAccessToken = "";
let naverAccessToken = "";
let googleAccessToken = "";

axios.get("http://localhost:3000/client-ids").then((res) => {
  kakaoClientId = res.data.kakaoClientId;
  naverClientId = res.data.naverClientId;
  naverSecret = res.data.naverSecret;
  naverClientSecret = res.data.naverClientSecret;
  googleClientId = res.data.googleClientId;
  googleClientSecret = res.data.googleClientSecret;
  console.log(`카카오 클라이언트 ID: ${kakaoClientId}`);
  console.log(`네이버 클라이언트 ID: ${naverClientId}`);
  console.log(`네이버 시크릿: ${naverSecret}`);
  console.log(`네이버 클라이언트 시크릿: ${naverClientSecret}`);
  console.log(`구글 클라이언트 ID: ${googleClientId}`);
  console.log(`구글 클라이언트 시크릿: ${googleClientSecret}`);
});

function renderUserInfo(imgURL, name) {
  userImage.src = imgURL;
  userName.textContent = name;
}

kakaoLoginButton.onclick = () => {
  location.href = `	https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${redirectURI}&response_type=code`;
};

naverLoginButton.onclick = () => {
  location.href = `https://nid.naver.com/oauth2.0/authorize?client_id=${naverClientId}&response_type=code&redirect_uri=${redirectURI}&state=${naverSecret}`;
};

googleLoginButton.onclick = () => {
  location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectURI}&response_type=code&scope=openid%20email%20profile`;
};

window.onload = () => {
  const url = new URL(location.href);
  const urlParams = url.searchParams;
  const authorizationCode = urlParams.get("code");
  const naverState = urlParams.get("state");
  const scope = urlParams.get("scope");

  if (authorizationCode) {
    if (naverState) {
      axios
        .post("http://localhost:3000/naver/login", { authorizationCode })
        .then((res) => {
          naverAccessToken = res.data;
          return axios.post("http://localhost:3000/naver/userinfo", {
            naverAccessToken,
          });
        })
        .then((res) => {
          renderUserInfo(res.data.profile_image, res.data.name);
          currentOAuthService = "naver";
        });
    } else if (scope) {
      axios
        .post("http://localhost:3000/google/login", { authorizationCode })
        .then((res) => {
          googleAccessToken = res.data;
          return axios.post("http://localhost:3000/google/userinfo", {
            googleAccessToken,
          });
        })
        .then((res) => {
          renderUserInfo(res.data.picture, res.data.name);
          currentOAuthService = "google";
        });
    } else {
      axios
        .post("http://localhost:3000/kakao/login", { authorizationCode })
        .then((res) => {
          kakaoAccessToken = res.data;
          return axios.post("http://localhost:3000/kakao/userinfo", {
            kakaoAccessToken,
          });
        })
        .then((res) => {
          renderUserInfo(res.data.profile_image, res.data.nickname);
          currentOAuthService = "kakao";
        });
    }
  }
};

logoutButton.onclick = () => {
  if (currentOAuthService === "kakao") {
    axios
      .delete("http://localhost:3000/kakao/logout", {
        data: { kakaoAccessToken },
      })
      .then((res) => {
        console.log(res.data);
        renderUserInfo("", "");
        location.href = redirectURI;
      });
  } else if (currentOAuthService === "naver") {
    axios
      .delete("http://localhost:3000/naver/logout", {
        data: { naverAccessToken },
      })
      .then((res) => {
        console.log(res.data);
        renderUserInfo("", "");
        location.href = redirectURI;
      });
  } else if (currentOAuthService === "google") {
    axios
      .delete("http://localhost:3000/google/logout", {
        data: { googleAccessToken },
      })
      .then((res) => {
        console.log(res.data);
        renderUserInfo("", "");
        location.href = redirectURI;
      });
  }
};
