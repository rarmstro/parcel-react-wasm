import React, { ReactNode } from "react";
import { useState } from "react";
import Button from "./Button";

function AddNums() {
  const [numA, setNumA] = useState(0);
  const [numB, setNumB] = useState(0);
  const [solution, setSolution] = useState("Place solution here");

  const handleA = (e: any) => {
    setNumA(e.target.value);
  };
  const handleB = (e: any) => {
    setNumB(e.target.value);
  };

  const handleButtonClick = () => {
    setSolution(globalThis._addNums(numA,numB));
  };

  return (
    <>
        <input type="text" id="numA" onChange={handleA} />
        <input type="text" id="numB" onChange={handleB} />
        <Button onClick={handleButtonClick}>
          Add Numbers
        </Button>
        <hr />
        <h3>{solution}</h3>
    </>
  );
}

export default AddNums;
