import React, { useState } from 'react';
import '../style/style.css'

export default function Textbox(props) {
    const [text, setText] = useState('');

    const handleChange = (event) => {
        setText(event.target.value);
    };

    const upperCase = () => {
        let newText = text.toUpperCase();
        setText(newText);
        props.showAlert('Converted to Uppercase', 'success');
    };

    const lowerCase = () => {
        let newText = text.toLowerCase();
        setText(newText);
        props.showAlert('Converted to Lowercase', 'success');
    };

    const capitalise = () => {
        let newText = text.replace(/(?:^|\.\s|\!\s|\?\s|\,\s|\:\s|\;\s)([a-z])/g, (match) => match.toUpperCase());
        newText = newText.charAt(0).toUpperCase() + newText.slice(1);
        setText(newText);
        props.showAlert('Capitalised', 'success');
    };


    const clearText = () => {
        setText('');
        props.showAlert('Text Cleared', 'success');
    };

    const copyText = () => {
        navigator.clipboard.writeText(text);
        props.showAlert('Text Copied to Clipboard', 'success');
    };

    const removeExtraSpaces = () => {
        let newText = text.replace(/ +/g, ' ');
        setText(newText.trim());
        props.showAlert('Extra Spaces Removed', 'success');
    };

    const removePara = () => {
        let newText = text.replace(/\s+/g, ' ').trim();
        setText(newText.trim());
        props.showAlert('Only one Paragraph Removed', 'success');
    }

    const sortTextLines = () => {
        let newText = text.split('\n').sort().join('\n');
        setText(newText.trim());
        props.showAlert('Text is Sorted', 'success');
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
                <button disabled={text.length === 0} className="btn btn-primary mx-1 my-1" onClick={capitalise}>Capitalise</button>
                <button disabled={text.length === 0} className="btn btn-primary mx-1 my-1" onClick={upperCase}>Upper Case</button>
                <button disabled={text.length === 0} className="btn btn-primary mx-1 my-1" onClick={lowerCase}>Lower Case</button>
                <button disabled={text.length === 0} className="btn btn-primary mx-1 my-1" onClick={removeExtraSpaces}>Remove Extra Spaces</button>
                <button disabled={text.length === 0} className="btn btn-primary mx-1 my-1" onClick={removePara}>Make one Paragraph</button>
                <button disabled={text.length === 0} className="btn btn-primary mx-1 my-1" onClick={sortTextLines}>Sort Text Line</button>
                <button disabled={text.length === 0} className="btn btn-secondary mx-1 my-1" onClick={copyText}>Copy Text</button>
                <button disabled={text.length === 0} className="btn btn-secondary mx-1 my-1" onClick={clearText}>Clear</button>
            </div>
            <div className="container" style={{ color: props.mode === 'dark' ? 'white' : 'black' }}>
                <div>
                    <h2 className='my-3'>Your Text Summary</h2>
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

