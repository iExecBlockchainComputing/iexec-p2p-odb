import React                   from 'react';
import List                    from '@material-ui/core/List';
import ListItem                from '@material-ui/core/ListItem';
import ListItemIcon            from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText            from '@material-ui/core/ListItemText';
import IconButton              from '@material-ui/core/IconButton';
import DeleteIcon              from '@material-ui/icons/Delete';
import ReceiptIcon             from '@material-ui/icons/Receipt';


export default (props) =>
	<List dense>
		{
			props.entries.map(entry =>
				<ListItem key={entry.hash}>
					<ListItemIcon>
						<ReceiptIcon/>
					</ListItemIcon>
					<ListItemText
						primary   = { <><strong>[{entry.type}]</strong> {entry.hash}</> }
						secondary = { <pre>{ JSON.stringify(entry) }</pre> }
					/>
					<ListItemSecondaryAction>
						<IconButton edge='end' aria-label='delete' onClick={ () => props.delete(entry) }>
							<DeleteIcon/>
						</IconButton>
					</ListItemSecondaryAction>
				</ListItem>
			)
		}
	</List>
