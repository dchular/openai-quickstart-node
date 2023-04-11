import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [animalInput, setAnimalInput] = useState("");
  const [result, setResult] = useState();
  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ character: animalInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
      setResult(data.result);
      setAnimalInput("");
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  useEffect(() => {
    // resultが空の場合は、linesに空の配列を設定する
    let lines
    if(typeof result !== 'string'){
      lines = result
    }
    else lines = result ? result.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    )) : [];
    setResult(lines);
  }, [result]);

  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <img src="/dog.png" className={styles.icon} />
        <h3>Enter character prompt</h3>
        <p> ex: LeBron James motivative way, Tsundere, Eren Yeager</p>
        <p>after push generate button wait for 15 seconds</p>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="animal"
            placeholder="Enter an character prompt"
            value={animalInput}
            onChange={(e) => setAnimalInput(e.target.value)}
          />
          <input type="submit" value="Generate response" />
        </form>
        <p>coming soon: form of calendar ID(automaticaly generating katstushika zaal calendar)</p>
        <div className={styles.result}>{result}</div>
      </main>
    </div>
  );
}
