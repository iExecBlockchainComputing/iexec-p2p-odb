import React from 'react';

export default () =>
{
	const [ running,  setRunning  ] = React.useState(false);
	const [ begin,    setBegin    ] = React.useState(0);
	const [ end,      setEnd      ] = React.useState(0);
	const [ duration, setDuration ] = React.useState(0);

	React.useEffect(() => {
		running ? setBegin(Date.now()) : setEnd(Date.now())
	}, [ running ]);

	React.useEffect(() => {
		!running && begin && end && setDuration(end-begin)
	}, [ running, begin, end ])

	return {
		start: () => setRunning(true),
		stop:  () => setRunning(false),
		duration
	};
};
