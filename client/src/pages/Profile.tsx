import AccountDetails from "@/components/AccountDetails";
import UserCard from "@/components/UserCard";

const Profile = () => {
  return (
    <div className="flex max-w-full flex-row gap-4 flex-1/2">
      <UserCard />
      <AccountDetails />
    </div>
  );
};

export default Profile;
