import UserCard from "@/components/UserCard";
import UserForm from "@/forms/UserForm/UserForm";

const UserProfile = () => {
  return (
    <div className="flex max-w-full flex-row gap-4">
      <UserCard />
      <UserForm />
    </div>
  );
};

export default UserProfile;
