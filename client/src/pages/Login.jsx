import Google from "../img/google.png";
import Facebook from "../img/facebook.png";
import Github from "../img/github.png";


const Login = () => {
  const google = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

  const github = () => {
    window.open("http://localhost:5000/auth/github", "_self");
  };

  const facebook = () => {
    window.open("http://localhost:5000/auth/facebook", "_self");
  };

  return (
    <div className="login">
     
      <div className="wrapper">
        <div className="left">
          <div className="loginButton google" onClick={google}>
            <img src={Google} alt="" className="icon" />
            Google
          </div>
          <div className="loginButton github" onClick={github}>
            <img src={Github} alt="" className="icon" />
            Github
          </div>
        </div>

        <div className="right">
					<input
						type="text"
						
						placeholder="UserName"
					/>
					<input
						type="text"
					
						placeholder="Email"
					/>
					<button  >
						Log Out
					</button>
				</div>
        </div>
      </div>
    
  );
};

export default Login;
