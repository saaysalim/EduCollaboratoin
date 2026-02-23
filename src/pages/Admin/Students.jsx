import { useSelector } from "react-redux";
import AntdTable from "../../components/AntdTable";
import { useState, useMemo } from "react";

const Students = () => {
  const departments = useSelector((state) => state.myReducer.departments);
  const students = useSelector((state) => state.myReducer.users).filter(
    (user) => user.role === "student" && user.account_status === "active"
  );
  const [filteredStudents, setFilteredStudents] = useState(students);

  const columns = useMemo(() => [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Department",
      render(item) {
        const department = departments ? departments.find((dept) => dept.value === item.department) : null;
        return department ? department.name : "";
      },
    },
    {
      title: "Grade",
      dataIndex: "grade",
    },
  ], [departments]);

  return (
    <div className="w-100">
      <h5 className="text-center">Students</h5>
      <AntdTable columns={columns} data={filteredStudents} width="80%" />
    </div>
  );
};

export default Students;
