import UserCard from "@/components/UserCard";
import UserForm from "@/forms/UserForm/UserForm";

const AdminProfile = () => {
  return (
    <div className="flex max-w-full flex-row gap-4 flex-1/2">
      <UserCard />
      <UserForm />
    </div>
  );
};

export default AdminProfile;
