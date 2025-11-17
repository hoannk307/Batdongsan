import Link from 'next/link'
import React from 'react'
import { Bell } from 'react-feather'
import { Media } from 'reactstrap'

const Notification = () => {
    return (
        <li className="onhover-dropdown notification-box">
            <Bell />
            <span className="label label-shadow label-pill notification-badge">3</span>
            <div className="notification-dropdown onhover-show-div">
                <div className="dropdown-title">
                    <h6>Notifications</h6>
                    <Link href='/myproperties/favourites'>Show all</Link>
                </div>
                <ul>
                    <li>
                        <Media className="media">
                            <div className="icon-notification bg-primary-light">
                                <i className="fab fa-xbox" />
                            </div>
                            <Media body className="media-body">
                                <h6>Item damaged</h6>
                                <span>8 hours ago, Tadawis 24</span>
                                <p className="mb-0">the table is broken:</p>
                                <ul className="user-group">
                                    <li>
                                        <img src="/assets/images/about/4.jpg" className="img-fluid" alt='' />
                                    </li>
                                    <li className="reply">
                                        <a href="#">Reply</a>
                                    </li>
                                </ul>
                            </Media>
                        </Media>
                    </li>
                    <li>
                        <Media className="media">
                            <div className="icon-notification bg-success-light">
                                <i className="fas fa-file-invoice-dollar" />
                            </div>
                            <Media body className="media-body">
                                <h6>Payment received</h6>
                                <span>2 hours ago, Bracka 15</span>
                                <ul className="user-group">
                                    <li>
                                        <img src="/assets/images/about/1.jpg" className="img-fluid" alt='' />
                                    </li>
                                    <li>
                                        <img src="/assets/images/about/2.jpg" className="img-fluid" alt='' />
                                    </li>
                                    <li>
                                        <img src="/assets/images/about/3.jpg" className="img-fluid" alt='' />
                                    </li>
                                </ul>
                            </Media>
                        </Media>
                    </li>
                    <li>
                        <Media className="media">
                            <div className="icon-notification bg-warning-light">
                                <i className="fas fa-comment-dots" />
                            </div>
                            <Media body className="media-body">
                                <h6>New inquiry</h6>
                                <span>1 Days ago, Krowada 7</span>
                                <p className="mb-0">is the villa still available?</p>
                                <ul className="user-group">
                                    <li>
                                        <img src="/assets/images/about/2.jpg" className="img-fluid" alt='' />
                                    </li>
                                    <li>
                                        <img src="/assets/images/about/3.jpg" className="img-fluid" alt='' />
                                    </li>
                                    <li className="reply">Reply</li>
                                </ul>
                            </Media>
                        </Media>
                    </li>
                </ul>
            </div>
        </li>
    )
}

export default Notification