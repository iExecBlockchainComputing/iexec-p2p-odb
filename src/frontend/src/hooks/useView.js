import React from 'react';

export default (startVisible = false) =>
{
	const [ visible, setVisible ] = React.useState(startVisible);
	return {
		visible,
		setVisible,
		show: () => setVisible(true),
		hide: () => setVisible(false),
	}
}
