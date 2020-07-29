import React   from 'react'
import Alert   from 'react-bootstrap/Alert'
import useView from '../hooks/useView';

export default (props) =>
{
	const view = useView(true);

	return (
		<Alert
			variant = { props.variant || 'primary' }
			show    = { view.visible }
			onClose = { () => view.hide() }
			dismissible
		>
			{ props.title && <Alert.Heading>{ props.title }</Alert.Heading> }
			{ props.children }
		</Alert>
	);
}
