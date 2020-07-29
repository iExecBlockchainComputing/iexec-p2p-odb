import React                   from 'react';
import List                    from '@material-ui/core/List';
import ListItem                from '@material-ui/core/ListItem';
import ListItemIcon            from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText            from '@material-ui/core/ListItemText';
import IconButton              from '@material-ui/core/IconButton';
import ReceiptIcon             from '@material-ui/icons/Receipt';
import FileCopyIcon            from '@material-ui/icons/FileCopy';

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
						secondary = { JSON.stringify(entry) }
					/>
					<ListItemSecondaryAction>
						<IconButton edge='end' aria-label='copy-to-clipboard' onClick={ () => navigator.clipboard.writeText(JSON.stringify(entry)) }>
							<FileCopyIcon/>
						</IconButton>
					</ListItemSecondaryAction>
				</ListItem>
			)
		}
	</List>
