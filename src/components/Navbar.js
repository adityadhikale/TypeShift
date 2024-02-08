import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from "@iconify/react";

import logo from '../images/logo.png'

export default function Navbar(props) {
  return (
    <>
      <nav className={`navbar navbar-expand-lg navbar-${props.mode} bg-${props.mode}`}>
        <div className="container-fluid" style={{ width: '86%' }}>
          <a className="navbar-brand" href="/">
            <img src={logo} alt="logo" className='logo' />
            {props.title}
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
        <div className="collapse navbar-collapse" id="navbarNav">
          <div className={`form-check form-switch toggle-btn container-fluid text-${props.mode === 'dark' ? 'light' : 'dark'}`}>
            <button type="button" className={`btn mx-1 ${props.mode === 'dark' ? 'btn-dark' : 'btn-light'}`} onClick={props.toggelmode}>
              {
                props.mode === 'dark' ? (<Icon icon="tdesign:mode-dark" style={{ color: 'white', height:'28px',width:'20px' }} />) : (<Icon icon="material-symbols:light-mode-outline" style={{ color: 'black' ,height:'28px',width:'20px' }} />)
              }
            </button>
            <label className="form-check-label ipad-display-none" >{props.mode === 'dark' ? 'Dark' : 'Light'} mode</label>
          </div>
        </div>
      </nav>
    </>
  )
}

Navbar.propTypes = {
  title: PropTypes.string
}

Navbar.defaultProps = {
  title: 'Enter title'
}