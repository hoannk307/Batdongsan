import Link from 'next/link'
import React from 'react'
import { Mail } from 'react-feather'
import { Media } from 'reactstrap'

const Mailbox = () => {
    return (
        <li className="onhover-dropdown">
            <Mail />
            <div className="notification-dropdown chat-dropdown onhover-show-div">
                <div className="dropdown-title">
                    <h6>Messages</h6>
                    <Link href='/manage-users/profile'>View all</Link>
                </div>
                <ul>
                    <li>
                        <Media className="media">
                            <div className="chat-user">
                                <img src="/assets/images/avatar/1.jpg" className="img-fluid" alt='' />
                            </div>
                            <Media body className="media-body">
                                <Link href='/manage-users/profile'>
                                    <h6>Bob Frapples</h6>
                                </Link>
                                <span>Template Represents simply...</span>
                            </Media>
                            <div className="status online">online</div>
                        </Media>
                    </li>
                    <li>
                        <Media className="media">
                            <div className="chat-user">
                                <img src="/assets/images/avatar/3.jpg" className="img-fluid" alt='' />
                            </div>
                            <Media body className="media-body">
                                <Link href='manage-users/profile'>
                                    <h6>Johan deo</h6>
                                </Link>
                                <span>Template Represents simply...</span>
                            </Media>
                            <div className="status away">Away</div>
                        </Media>
                    </li>
                    <li>
                        <Media className="media">
                            <div className="chat-user">
                                <img src="/assets/images/avatar/4.jpg" className="img-fluid" alt='' />
                            </div>
                            <Media body className="media-body">
                                <Link href='manage-users/profile'>
                                    <h6>Greta Life</h6>
                                </Link>
                                <span>Template Represents simply...</span>
                            </Media>
                            <div className="status online">online</div>
                        </Media>
                    </li>
                    <li>
                        <Media className="media">
                            <div className="chat-user">
                                <img src="/assets/images/avatar/7.jpg" className="img-fluid" alt='' />
                            </div>
                            <Media body className="media-body">
                                <Link href='manage-users/profile'>
                                    <h6>Aruna jho</h6>
                                </Link>
                                <span>Template Represents simply...</span>
                            </Media>
                            <div className="status busy">Busy</div>
                        </Media>
                    </li>
                </ul>
            </div>
        </li>
    )
}

export default Mailbox
