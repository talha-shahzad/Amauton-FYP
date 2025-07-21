// @ts-nocheck
import React, { useState } from "react";
import "./KeywordInput.css"; 

// This interface will help the type script understand the type of input and output
interface KeywordInputProps {
    onSubmit: (keyword: string) => void;
}

const KeywordInput: React.FC<KeywordInputProps> = ({ onSubmit }) => {
    // Setting up the varibles in case of success the keyword is set
    // Otherwise the error will be set and relevent error will be displayed
    const [keyword, setKeyword] = useState("");
    const [error, setError] = useState("");

    // This function will check the input for rubish words to cater useless inputs
    const isNonsenseWord = (word: string): boolean => {
         // Matches vowels
        const vowelRegex = /[aeiou]/i;
        // Matches consonants
        const consonantRegex = /[^aeiou ]/i; 

        const vowels = (word.match(vowelRegex) || []).length;
        const consonants = (word.match(consonantRegex) || []).length;

        //High consonant-to-vowel ratio or low vowel count is considered nonsensical
        if (vowels === 0 || consonants / (vowels + 1) > 5) {
            return true;
        }

        // Reject if there are repeating patterns 
        const repeatingPatternRegex = /(.)\1{2,}/;
        if (repeatingPatternRegex.test(word)) {
            return true;
        }

        return false;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Regular expressions matchinf to remove numbers and special charachter inputs
        // Checks for special characters
        const specialCharRegex = /[^a-zA-Z0-9 ]/; 
        // Checks if the entire string consists of numbers
        const numbersOnlyRegex = /^[0-9]+$/; 

        // These will display the errors in the keyword inputs
        // *******
        if (keyword.trim() === "") {
            setError("Keyword cannot be empty");
            return;
        }
        if (specialCharRegex.test(keyword)) {
            setError("Keyword contains invalid characters. Only letters, numbers, and spaces are allowed.");
            return;
        }
        if (numbersOnlyRegex.test(keyword)) {
            setError("Keyword cannot consist of only numbers. Please enter valid text.");
            return;
        }
        if (isNonsenseWord(keyword)) {
            setError("Kindly enter a meaningful word.");
            return;
        }
        //******* 
        setError(""); 
        onSubmit(keyword);
        setKeyword(""); 
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="keyword-input-form">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value);
                        setError(""); 
                    }}
                    placeholder="Enter keyword"
                    className="keyword-input"
                    aria-label="Keyword input"
                />
                <button type="submit" className="keyword-input-button">
                    Search
                </button>
            </form>
             {/* Display error */}
            {error && <p className="keyword-input-error">{error}</p>}
        </div>
    );
};

export default KeywordInput;
