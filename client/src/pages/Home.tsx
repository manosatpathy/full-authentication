import { useAppContext } from "@/context/AppContext";

const Home = () => {
  const { user } = useAppContext();

  return (
    <div className="font-bold text-3xl">{`Welcome ${user?.username}`}</div>
  );
};

export default Home;
