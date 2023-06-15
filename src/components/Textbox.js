import React, { useState } from 'react'

export default function Textbox(props) {

    const handelonchange = (event) => {
        settext(event.target.value);
    }

    const upperCase = () => {
        let newtext = text.toUpperCase();
        settext(newtext);
        props.showAlert('Conver to Uppercase','success');
    }

    const lowerCase = () =>{
        let newtext = text.toLowerCase();
        settext(newtext);
        props.showAlert('Conver to Lowercase','success');
    }

    const paraCase = () =>{
        let newtext = text.charAt(0).toUpperCase() + text.slice(1);
        settext(newtext);
        props.showAlert('Capitalized','success');
    }

    const clearCase =() =>{
        let newtext = '';
        settext(newtext);
        props.showAlert('Text is Cleared','success');
    }

    const copyCase =()=>{
        let newtext = document.getElementById('textBox')
        newtext.select();
        navigator.clipboard.writeText(newtext.value);
        props.showAlert('Copied to Clipboard','success');
    }

    const spaceCase =() =>{
        let newtext = text.split(/[ ]+/);
        settext(newtext.join(" "));
        props.showAlert('Extra Space removed','success');
    }

    const [text, settext] = useState('');

    return (
        <>
            <div className='container my-3' style={{color:props.mode==='dark'?'white':'black'}}>
                <div className="mb-3">
                    <label className="form-label my-3">{props.heading}</label>
                    <textarea className="form-control" id="textBox" rows="10" placeholder='Type or paste your text...' value={text} onChange={handelonchange} style={{backgroundColor:props.mode==='dark'?'#6C757D':'white', color:props.mode==='dark'?'white':'black'}}></textarea>
                </div>
                <button disabled={text.length===0} className="btn btn-primary mx-1 my-1" onClick={paraCase}>Capitalize</button>
                <button disabled={text.length===0} className="btn btn-primary mx-1 my-1" onClick={upperCase}>Upper Case</button>
                <button disabled={text.length===0} className="btn btn-primary mx-1 my-1" onClick={lowerCase}>Lower Case</button>
                <button disabled={text.length===0} className="btn btn-primary mx-1 my-1" onClick={spaceCase}>Remove Extra Space</button>
                <button disabled={text.length===0} className="btn btn-secondary mx-1 my-1" onClick={copyCase}>Copy Text</button>
                <button disabled={text.length===0} className="btn btn-secondary mx-1 my-1" onClick={clearCase}>Clear</button>
            </div>
            <div className="container" style={{color:props.mode==='dark'?'white':'black'}}>
                <h2 className='my-3'>Your text Summary</h2>
                <p>Words - {text.split(/\s+/).filter((element)=>{
                    return element.length!==0}).length}<br />Characters - {text.length}</p>
                <h3>Preview</h3>
                <p>{text.length>0?text:'Nothing to preview.'}</p>
            </div>
        </>
    )
}
