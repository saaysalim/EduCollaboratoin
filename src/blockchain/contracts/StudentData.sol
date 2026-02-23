// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentData {
    struct Student {
        string academicDetails;
        string permanentAddress;
        string academicPercentage;
    }

    mapping(address => Student) public students;

    function storeStudentData(string memory _academicDetails, string memory _permanentAddress, string memory _academicPercentage) public {
        students[msg.sender] = Student(_academicDetails, _permanentAddress, _academicPercentage);
    }

    function getStudentData(address _student) public view returns (string memory, string memory, string memory) {
        Student memory student = students[_student];
        return (student.academicDetails, student.permanentAddress, student.academicPercentage);
    }
}

