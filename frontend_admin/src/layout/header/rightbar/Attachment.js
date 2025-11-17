import Link from 'next/link'
import React from 'react'
import { Save } from 'react-feather'
import { Media } from 'reactstrap'

const Attachment = () => {
    return (
        <li className="onhover-dropdown">
            <Save />
            <div className="notification-dropdown onhover-show-div">
                <div className="dropdown-title">
                    <h6>Recent Attachments</h6>
                    <Link href='/reports'>Show all</Link>
                </div>
                <ul>
                    <li>
                        <Media className="media">
                            <div className="icon-notification bg-success-light">
                                <i className="fas fa-file-word" />
                            </div>
                            <Media body className="media-body">
                                <Link href='/reports'>
                                    <h6>Doc_file.doc</h6>
                                </Link>
                                <span>800MB</span>
                            </Media>
                        </Media>
                    </li>
                    <li>
                        <Media className="media">
                            <div className="icon-notification bg-primary-light">
                                <i className="fas fa-file-image" />
                            </div>
                            <Media body className="media-body">
                                <Link href='/reports'>
                                    <h6>Apartment.jpg</h6>
                                </Link>
                                <span>500kb</span>
                            </Media>
                        </Media>
                    </li>
                    <li>
                        <Media className="media">
                            <div className="icon-notification bg-warning-light">
                                <i className="fas fa-file-pdf" />
                            </div>
                            <div className="media-body">
                                <Link href='/reports'>
                                    <h6>villa_report.pdf</h6>
                                </Link>
                                <span>26MB</span>
                            </div>
                        </Media>
                    </li>
                </ul>
            </div>
        </li>
    )
}

export default Attachment