import React, { memo} from 'react';
import { Pagination } from 'react-bootstrap';

const Paginator = (props) => {
    const pageItems = []

    if(props.pageSize > 0) {
        for(let i = 0; i < Math.ceil(props.totalSize / props.pageSize); i++) {
            pageItems.push(
                <Pagination.Item key={i} onClick={() => props.paginate(i+1)}  >
                    {i+1}
                </Pagination.Item>
            )
        }

        if(Math.ceil(props.totalSize / props.pageSize) > 1) {
            return (
                <div>
                    <Pagination>{pageItems}</Pagination>
                </div>
            )
        }
    }
    
    return (
        <>
        </>
    )
}

export default memo(Paginator)