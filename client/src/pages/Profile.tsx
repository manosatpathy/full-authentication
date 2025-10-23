import AccountDetails from "@/components/AccountDetails";
import UserCard from "@/components/UserCard";

const Profile = () => {
  return (
    <div className="flex gap-4 max-w-full md:flex-row flex-col">
      <UserCard />
      <AccountDetails />
    </div>
  );
};

export default Profile;
