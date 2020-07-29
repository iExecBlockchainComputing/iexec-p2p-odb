import React           from 'react';
import { makeStyles }  from '@material-ui/core/styles';
import SpeedDial       from '@material-ui/lab/SpeedDial';
import SpeedDialIcon   from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';

const useStyles = makeStyles((theme) => ({
	speedDial: {
		position: 'absolute',
		'&.MuiSpeedDial-directionUp': {
			bottom: theme.spacing(2),
			right: theme.spacing(2),
		},
	},
}));

export default (props) =>
{
	const classes = useStyles();
	const [open, setOpen] = React.useState(false);

	return (
		<SpeedDial
			ariaLabel="SpeedDial example"
			className={classes.speedDial}
			icon={<SpeedDialIcon />}
			onClose={() => setOpen(false)}
			onOpen={() => setOpen(true)}
			open={open}
			direction={'up'}
		>
			{
				props.actions.map(action => (
					<SpeedDialAction
						key={action.name}
						icon={action.icon}
						tooltipTitle={action.name}
						onClick={action.fun}
					/>
				))
			}
		</SpeedDial>
	);
}
