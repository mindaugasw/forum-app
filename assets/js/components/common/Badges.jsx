import React from "react";
import {Badge} from "react-bootstrap";

export function BadgeAdmin() {
    return <Badge variant='success' className='ml-2'>Admin</Badge>;
}

export function BadgeAuthor() {
    return <Badge variant='primary' className='ml-2'>Author</Badge>;
}
