import {useLoginWithTelegram} from '@privy-io/react-auth';

const TelegramLogin = () => {
  const {login, state} = useLoginWithTelegram();
  const handleLogin = async () => {
    await login();
  };
  return (
    <div className="grid grid-cols-2 gap-3 justify-center items-center">
      <button onClick={handleLogin} className="btn">
        <div className="btn-text">Login with Telegram</div>
      </button>
      <p className="status-text">Status: {state.status}</p>
    </div>
  );
};

export default TelegramLogin;
