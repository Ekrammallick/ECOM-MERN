import {Routes,Route} from "react-router-dom";
import { HomePage } from "./pages/HomePage"
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function app(){
// const [count,setCount] = useState(0);
return(
  <div>
    
    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/signup" element={<SignUpPage/>} />
      <Route path="/login" element={<LoginPage/>} />
    </Routes>
  </div>
)
}

export default app