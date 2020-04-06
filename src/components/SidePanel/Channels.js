import React, { Fragment } from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel } from "../../actions";
import {
	Menu,
	Icon,
	Modal,
	Form,
	Input,
	Button,
	Label,
} from "semantic-ui-react";

class Channels extends React.Component {
	state = {
		user: this.props.currentUser,
		channels: [],
		activeChannel: "",
		channelName: "",
		channelDetails: "",
		channelsRef: firebase.database().ref("channels"),
		modal: false,
		firstLoad: true,
	};

	componentDidMount() {
		this.addListeners();
	}

	addListeners = () => {
		let loadedChannels = [];
		this.state.channelsRef.on("child_added", (snap) => {
			loadedChannels.push(snap.val());
			this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
		});
	};

	setFirstChannel = () => {
		if (this.state.firstLoad && this.state.channels.length > 0) {
			this.props.setCurrentChannel(this.state.channels[0]);
			this.setActiveChannel(this.state.channels[0]);
		}
		this.setState({ firstLoad: false });
	};

	addChannel = () => {
		const { channelsRef, channelName, channelDetails, user } = this.state;

		const key = channelsRef.push().key;

		const newChannel = {
			id: key,
			name: channelName,
			details: channelDetails,
			createdBy: {
				name: user.displayName,
				avatar: user.photoURL,
			},
		};

		channelsRef
			.child(key)
			.update(newChannel)
			.then(() => {
				this.setState({ channelName: "", channelDetails: "" });
				this.closeModal();
				console.log("channelAdded");
			})
			.catch((error) => {
				console.error(error);
			});
	};

	changeChannel = (channel) => {
		this.setActiveChannel(channel);
		this.props.setCurrentChannel(channel);
	};

	setActiveChannel = (channel) => {
		this.setState({ activeChannel: channel.id });
	};

	displayChannels = (channels) =>
		channels &&
		channels.length > 0 &&
		channels.map((channel) => (
			<Menu.Item
				key={channel.id}
				onClick={() => this.changeChannel(channel)}
				name={channel.name}
				style={{
					opacity: 0.7,
				}}
				active={channel.id == this.state.activeChannel}
			>
				# {channel.name}
				{channel.id == this.state.activeChannel ? (
					<Icon name='eye' size='large' />
				) : (
					""
				)}
			</Menu.Item>
		));

	handleSubmit = (event) => {
		event.preventDefault();
		if (this.isFormValid(this.state)) {
			this.addChannel();
		}
	};

	isFormValid = ({ channelName, channelDetails }) =>
		channelName && channelDetails;

	handleChange = (event) => {
		this.setState({ [event.target.name]: event.target.value });
	};

	openModal = () => {
		this.setState({ modal: !this.state.modal });
	};

	closeModal = () => {
		this.setState({ modal: false });
	};

	render() {
		const { channels, modal } = this.state;
		return (
			<Fragment>
				<Menu.Menu style={{ padding: "1.2em" }}>
					<Menu.Item>
						<span>
							<Icon name='exchange' /> Channels (
							{channels ? channels.length : "0"}){" "}
						</span>
						<Icon name='add' onClick={this.openModal} />
						{this.displayChannels(channels)}
					</Menu.Item>
					<Modal closeIcon basic open={modal} onClose={this.closeModal}>
						<Modal.Header> Add a channel</Modal.Header>
						<Modal.Content>
							<Form onSubmit={this.handleSubmit}>
								<Form.Field>
									<Input
										fluid
										label='Name of channel'
										name='channelName'
										onChange={this.handleChange}
									/>
								</Form.Field>
								<Form.Field>
									<Input
										fluid
										label='About channel'
										name='channelDetails'
										onChange={this.handleChange}
									/>
								</Form.Field>
							</Form>
						</Modal.Content>
						<Modal.Actions>
							<Button
								positive
								icon='checkmark'
								labelPosition='right'
								content='Add'
								onClick={this.handleSubmit}
							/>
						</Modal.Actions>
						{/* <Modal.Actions>
							<Button color='green' inverted>
								<Icon name='check' /> Add
							</Button>
							<Button color='orange' inverted onClick={this.closeModal}>
								<Icon name='remove' /> Cancel
							</Button>
						</Modal.Actions> */}
					</Modal>
				</Menu.Menu>
			</Fragment>
		);
	}
}

export default connect(null, { setCurrentChannel })(Channels);
