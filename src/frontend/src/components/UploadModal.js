import React         from 'react';
import { useFormik } from 'formik';
import * as Yup      from 'yup';
import Modal         from 'react-bootstrap/Modal';
import Form          from 'react-bootstrap/Form';
import Button        from 'react-bootstrap/Button';
import liborders     from '../utils/liborders';

const isValidStruct = (value, list) =>
{
	try
	{
		return list.indexOf(liborders.type(JSON.parse(value))) != -1
	}
	catch
	{
		return false
	}
}

export default (props) =>
{
	const formik = useFormik({
		initialValues: {
			domain: JSON.stringify({ name:"iExecODB", chainId: 1, version: "5.0.0", verifyingContract: "0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f" }),
			order:  JSON.stringify({}),
		},
		validationSchema: Yup.object({
			domain:
				Yup.string()
				.test(
					'json',
					'Invalid domain',
					value => isValidStruct(value, [ 'EIP712Domain' ])
				)
				.required('Required'),
			order:
				Yup.string()
				.test(
					'json',
					'Invalid order',
					value => isValidStruct(value, [ 'AppOrder', 'DatasetOrder', 'WorkerpoolOrder', 'RequestOrder' ])
				)
				.required('Required'),
		}),
		onSubmit: props.submit,
	});

	return (
		<Modal show={props.view.visible} onHide={props.view.hide} size='xl' centered>
			<Modal.Header closeButton>
				<Modal.Title>
					Upload order
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form noValidate onSubmit={formik.handleSubmit}>
					<Form.Group>
						<Form.Label className='d-block font-weight-bold'>
							Domain
						</Form.Label>
						<Form.Control
							id        = 'domain'
							as        = 'textarea'
							rows      = '1'
							isValid   = { formik.touched.domain && !formik.errors.domain }
							isInvalid = { !!formik.errors.domain }
							{...formik.getFieldProps('domain')}
						/>
						{ formik.errors.domain && <Form.Control.Feedback type='invalid' tooltip>{ formik.errors.domain }</Form.Control.Feedback> }
					</Form.Group>
					<Form.Group>
						<Form.Label className='d-block font-weight-bold'>
							Order
						</Form.Label>
						<Form.Control
							id        = 'order'
							as        = 'textarea'
							rows      = '3'
							isValid   = { formik.touched.order && !formik.errors.order }
							isInvalid = { !!formik.errors.order }
							{...formik.getFieldProps('order')}
						/>
						{ formik.errors.order && <Form.Control.Feedback type='invalid' tooltip>{ formik.errors.order }</Form.Control.Feedback> }
					</Form.Group>
					<Button type='submit'>Submit</Button>
				</Form>
			</Modal.Body>
		</Modal>
	);
}
