import React from 'react'

export default function About(props) {
    // document.title=`${props.title} - About`
    return (
        <>
            <div className='container my-5' style={{ color: props.mode === 'dark' ? 'white' : 'black' }} >
                <h2 className='my-2'>About {props.title}</h2>
                <p className='my-2'>
                    In literary theory, a text is any object that can be "read", whether this object is a work of literature, a street sign, an arrangement of buildings on a city block, or styles of clothing. It is a coherent set of signs that transmits some kind of informative message.This set of signs is considered in terms of the informative message's content, rather than in terms of its physical form or the medium in which it is represented.
                </p>
                <p>
                    Within the field of literary criticism, "text" also refers to the original information content of a particular piece of writing; that is, the "text" of a work is that primal symbolic arrangement of letters as originally composed, apart from later alterations, deterioration, commentary, translations, paratext, etc. Therefore, when literary criticism is concerned with the determination of a "text", it is concerned with the distinguishing of the original information content from whatever has been added to or subtracted from that content as it appears in a given textual document that is, a physical representation of text.
                </p>
            </div >
        </>
    )
}
