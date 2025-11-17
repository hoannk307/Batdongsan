import React from 'react'
import Attachment from './Attachment'
import Mailbox from './Mailbox'
import Notification from './Notification'
import UserProfile from './UserProfile'

const Rightbar = () => {
    return (
        <>
            <Attachment />
            <Notification />
            <Mailbox />
            <UserProfile />
        </>
    )
}
export default Rightbar
