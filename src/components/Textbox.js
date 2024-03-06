import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Icon } from "@iconify/react";

import '../style/style.css'

export default function Textbox(props) {
    const [text, setText] = useState('');
    const [textHistory, setTextHistory] = useState([]);

    const handleChange = (event) => {
        const newText = event.target.value;
        setText(newText);
        setTextHistory([...textHistory, newText]);
    };


    const undo = () => {
        if (textHistory.length > 0) {
            const previousText = textHistory[textHistory.length - 1];
            const newTextHistory = textHistory.slice(0, -1);
            setText(previousText);
            setTextHistory(newTextHistory);
            toast.success('Undo successful');
        } else {
            toast.error('Nothing to undo');
        }
    };

    const upperCase = () => {
        let newText = text.toUpperCase();
        setText(newText);
        return toast.success('Converted to Uppercase');
    };

    const lowerCase = () => {
        let newText = text.toLowerCase();
        setText(newText);
        return toast.success('Converted to Lowercase');
    };

    const capitalise = () => {
        // eslint-disable-next-line
        let newText = text.replace(/(?:^|\.\s|\!\s|\?\s|\,\s|\:\s|\;\s)([a-z])/g, (match) => match.toUpperCase());
        newText = newText.charAt(0).toUpperCase() + newText.slice(1);
        setText(newText);
        return toast.success('Capitalised');
    };


    const clearText = () => {
        setText('');
        return toast.success('Text Cleared');
    };

    const copyText = () => {
        navigator.clipboard.writeText(text);
        return toast.success('Text Copied to Clipboard');
    };

    const removeExtraSpaces = () => {
        let newText = text.replace(/ +/g, ' ');
        setText(newText.trim());
        return toast.success('Extra Spaces Removed');
    };

    const removePara = () => {
        let newText = text.replace(/\s+/g, ' ').trim();
        setText(newText.trim());
        return toast.success('Only one Paragraph Removed');
    }

    const sortTextLines = () => {
        let newText = text.split('\n').sort().join('\n');
        setText(newText.trim());
        return toast.success('Text is Sorted');
    };


    return (
        <>
            <div className='container my-1' style={{ color: props.mode === 'dark' ? 'white' : 'black' }}>
                <div className="mb-3">
                    <label className="form-label my-3">{props.heading}</label>
                    <textarea
                        className={`form-control ${props.mode === 'dark' ? 'text-white' : 'text-black'}`}
                        id="textBox"
                        rows="10"
                        placeholder='Type or Paste your text...'
                        value={text}
                        onChange={handleChange}
                        style={{ backgroundColor: props.mode === 'dark' ? '#74747400' : 'white', color: props.mode === 'dark' ? 'white' : 'black', }}
                    ></textarea>
                </div>
                <h4>Options</h4>
                <button disabled={text.length === 0} className="btn btn-primary mx-1 my-1" onClick={capitalise}>Capitalise
                </button>
                <button disabled={text.length === 0} className="btn btn-primary mx-1 my-1" onClick={upperCase}>Upper Case</button>
                <button disabled={text.length === 0} className="btn btn-primary mx-1 my-1" onClick={lowerCase}>Lower Case</button>
                <button disabled={text.length === 0} className="btn btn-primary mx-1 my-1" onClick={removeExtraSpaces}>Remove Extra Spaces</button>
                <button disabled={text.length === 0} className="btn btn-primary mx-1 my-1" onClick={removePara}>Make one Paragraph</button>
                <button disabled={text.length === 0} className="btn btn-primary mx-1 my-1" onClick={sortTextLines}>Sort Text Line</button>
                <button disabled={text.length === 0} className="btn btn-success mx-1 my-1" onClick={copyText}>
                    <Icon icon="solar:copy-linear" style={{ color: 'white', height: '23px', width: '20px' }} /> Copy
                </button>
                <button disabled={text.length === 0} className="btn btn-danger mx-1 my-1" onClick={clearText}>
                    <Icon icon="ri:delete-bin-6-line" style={{ color: 'white', height: '25px', width: '20px' }} /> Clear
                </button>
                <button disabled={text.length === 0} className="btn btn-secondary mx-1 my-1" onClick={undo}>
                    <Icon icon="ic:round-undo"  style={{color: 'white', height: '20px', width: '21px'}} /> Undo
                </button>
            </div>
            <div className="container" style={{ color: props.mode === 'dark' ? 'white' : 'black' }}>
                <div>
                    <h3 className='my-3'>Your Text Summary</h3>
                    <p>Words - {text.split(/\s+/).filter((element) => element.length !== 0).length}<br />Characters - {text.length}</p>
                </div>
                <hr />
                <h3>Preview</h3>
                <div >
                    <p>{text.length > 0 ? text : 'Nothing to preview.'}</p>
                </div>
            </div>
        </>
    );
}

