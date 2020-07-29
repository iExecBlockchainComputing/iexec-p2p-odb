import React      from 'react'
import Collapse   from '@material-ui/core/Collapse';
import Alert      from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon  from '@material-ui/icons/Close';

export default (props) =>
{
	const [ open, setOpen ] = React.useState(true);
	return (
			<Collapse in={open}>
				<Alert
					severity={props.severity}
					action={
						<IconButton aria-label='close' color='inherit' size='small' onClick={() => setOpen(false)}>
							<CloseIcon fontSize='inherit' />
						</IconButton>
					}
				>
					{ props.title && <AlertTitle>{ props.title }</AlertTitle> }
					{ props.text }
				</Alert>
			</Collapse>
	);
}
