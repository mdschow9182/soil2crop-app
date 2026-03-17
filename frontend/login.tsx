import { useLanguage } from "../context/LanguageContext";


const Login = () => {
  const { t } = useLanguage();

  return (
    <div>
      <h2>{t.login}</h2>
    </div>
  );
};

export default Login;
