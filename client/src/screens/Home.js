/**
 *
 * @author Anass Ferrak aka " TheLordA " <ferrak.anass@gmail.com>
 * GitHub repo: https://github.com/TheLordA/Instagram-Clone
 *
 */

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AuthenticationContext from "../contexts/auth/Auth.context";
import { BOOKMARK_POST } from "../contexts/types.js";
import Navbar from "../components/Navbar";
import { config as axiosConfig, ALL_POST_URL, API_BASE_URL } from "../config/constants";
// Material-UI Components
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Avatar from "@material-ui/core/Avatar";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
// Material-UI Icons
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import SendIcon from "@material-ui/icons/Send";
import BookmarkIcon from "@material-ui/icons/Bookmark";
import BookmarkBorderIcon from "@material-ui/icons/BookmarkBorder";
import { CircularProgress, Snackbar } from "@material-ui/core";

// General style
const useStyles = makeStyles((theme) => ({
	root: {
		maxWidth: 500,
		margin: "20px auto",
		"& .MuiTextField-root": {
			width: "100%",
		},
		"& .MuiOutlinedInput-multiline": {
			paddingTop: "8px",
			paddingBottom: "8px",
			marginTop: "5px",
			marginLeft: "5px",
			marginRight: "5px",
		},
		"& .MuiCardContent-root:last-child": {
			paddingBottom: "10px",
		},
		"& .MuiDivider-middle": {
			marginBottom: "4px",
		},
		"& .MuiListItem-root": {
			padding: "0px 16px",
		},
		"& .MuiCardContent-root": {
			paddingTop: "0px",
			paddingBottom: "5px",
		},
		"& .MuiIconButton-root:focus": {
			backgroundColor: "rgba(0, 0, 0, 0)",
		},
	},
	header: {
		padding: "10px",
	},
	media: {
		paddingTop: "56.25%", // 16:9
		height: "max-content",
	},
	likeBar: {
		height: "25px",
		paddingTop: "0px",
		marginTop: "8px",
		marginLeft: "2px",
		paddingLeft: "0px",
		paddingBottom: "4px",
	},
	comments: {
		display: "flex",
		paddingTop: "0px",
		paddingLeft: "12px",
		paddingRight: "0px",
	},
	comment_item_see_more: {
		width: "35%",
		cursor: "pointer",
	},
	comments_icon_see_more: {
		height: "17px",
		width: "17px",
		paddingTop: "4px",
		paddingBottom: "3px",
	},
	comments_icon: {
		height: "30px",
		paddingLeft: "0px",
		paddingTop: "13px",
		paddingRight: "8px",
		paddingBottom: "0px",
	},
	inline: {
		display: "inline",
		fontWeight: "600",
	},
	avatar: {
		height: "40px",
	},
	links: {
		textDecoration: "none",
	},
}));

const Home = () => {
	const classes = useStyles();
	const { state, dispatch } = useContext(AuthenticationContext);

	const [data, setData] = useState([]);

	const [comment, setComment] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const config = axiosConfig(localStorage.getItem("jwt"));

	useEffect(() => {
		axios.get(ALL_POST_URL, config)
			.then((res) => {
				if (Array.isArray(res.data.posts)) {
					setData(res.data.posts);
				} else {
					console.error("Posts data is not an array.");
				}
				setLoading(false);
			})
			.catch((err) => {
				setLoading(false);
				setError("Failed to load posts. Please try again.");
				console.log(err);
			});
	}, []);
	const updateLikesLocally = (postId, liked) => {
		setData((prevData) =>
			prevData.map((item) => {
				if (item._id !== postId) return item;
				let newLikes;
				if (liked) {
					newLikes = [...item.Likes, state.user._id];
				} else {
					newLikes = item.Likes.filter((id) => id !== state.user._id);
				}
				return { ...item, Likes: newLikes };
			})
		);
	};
	

	const likePost = (id) => {
		updateLikesLocally(id, true); // instantly update
		axios.put(`${API_BASE_URL}/like`, { postId: id }, config).catch((err) => {
			console.error("Failed to like, rolling back");
			updateLikesLocally(id, false); // rollback on error
		});
	};
	
	const unlikePost = (id) => {
		updateLikesLocally(id, false); // instantly update
		axios.put(`${API_BASE_URL}/unlike`, { postId: id }, config).catch((err) => {
			console.error("Failed to unlike, rolling back");
			updateLikesLocally(id, true); // rollback on error
		});
	};
const updateBookmarksLocally = (postId, isAdding) => {
	dispatch({
		type: BOOKMARK_POST,
		payload: {
			Bookmarks: isAdding
				? [...(state.Bookmarks || []), postId]
				: (state.Bookmarks || []).filter((id) => id !== postId),
		},
	});
};

	
	
	
	const bookmark = (id) => {
		updateBookmarksLocally(id, true); // Optimistically add
		axios
			.put(`${API_BASE_URL}/bookmark-post`, { postId: id }, config)
			.then((result) => {
				dispatch({
					type: BOOKMARK_POST,
					payload: { Bookmarks: result.data.Bookmarks },
				});
				localStorage.setItem("user", JSON.stringify(result.data));
			})
			.catch((err) => {
				console.error("Failed to bookmark, rolling back");
				updateBookmarksLocally(id, false); // Rollback on error
			});
	};
	

	const removeBookmark = (id) => {
		updateBookmarksLocally(id, false); // Optimistically remove
		axios
			.put(`${API_BASE_URL}/remove-bookmark`, { postId: id }, config)
			.then((result) => {
				dispatch({
					type: BOOKMARK_POST,
					payload: { Bookmarks: result.data.Bookmarks },
				});
				localStorage.setItem("user", JSON.stringify(result.data));
			})
			.catch((err) => {
				console.error("Failed to remove bookmark, rolling back");
				updateBookmarksLocally(id, true); // Rollback on error
			});
	};
	
	const makeComment = (text, postId) => {
		setComment(""); // clear the input immediately
	
		axios.put(`${API_BASE_URL}/comment`, { text, postId }, config)
			.then((result) => {
				const newData = data.map((item) => {
					if (result.data._id === item._id) return result.data;
					else return item;
				});
				console.log("newData",newData)
				setData(newData); // update the UI with new comments
			})
			.catch((err) => console.log(err));
	};
	

	// const deletePost = (postId) => {
	// 	axios.delete(`${API_BASE_URL}/deletepost/${postId}`, config).then((res) => {
	// 		const newData = data.filter((item) => {
	// 			return item._id !== res.data;
	// 		});
	// 		setData(newData);
	// 	});
	// };

	// Handle loading state
	if (loading) {
		return <CircularProgress />;
	}

	// Handle error state
	if (error) {
		return <Snackbar open={true} message={error} autoHideDuration={3000} />;
	}

	return (
		<>
			<Navbar />
			{data.map((item) => (
				<div className="home" key={item._id}>
					<Card className={classes.root}>
						<CardHeader
							className={classes.header}
							avatar={
								<Avatar>
									<img
										className={classes.avatar}
										alt=""
										src={`data:${item.PhotoType};base64,${item.Photo}`}
									/>
								</Avatar>
							}
							title={
								<Link
									className={classes.links}
									to={
										item.PostedBy._id !== state._id
											? `/profile/${item.PostedBy._id}`
											: "/profile"
									}
								>
									{item.PostedBy.Name}
								</Link>
							}
							subheader="September 14, 2016"
						/>

						<CardMedia
							className={classes.media}
							image={`data:${item.PhotoType};base64,${item.Photo}`}
							title="Post Image"
						/>

						<CardActions className={classes.likeBar} disableSpacing>
						{item.Likes.includes(state?.user?._id) ? (
	<IconButton
		aria-label="Like"
		color="secondary"
		onClick={() => unlikePost(item._id)}
	>
		<FavoriteIcon />
	</IconButton>
) : (
	<IconButton
		aria-label="Like"
		onClick={() => likePost(item._id)}
	>
		<FavoriteBorderIcon />
	</IconButton>
)}

							<IconButton aria-label="comments">
								<ChatBubbleOutlineIcon />
							</IconButton>
							{state?.Bookmarks?.includes(item._id) ? (
								<IconButton
									aria-label="Remove Bookmark"
									style={{ marginLeft: "auto", color: "#e0d011" }}
									onClick={() => {
										removeBookmark(item._id);
									}}
								>
									<BookmarkIcon />
								</IconButton>
							) : (
								<IconButton
									aria-label="Bookmark"
									style={{ marginLeft: "auto" }}
									onClick={() => {
										bookmark(item._id);
									}}
								>
									<BookmarkBorderIcon />
								</IconButton>
							)}
						</CardActions>

						<CardContent>
							<Typography variant="subtitle2" display="block" gutterBottom>
								{item.Likes.length} Likes
							</Typography>
							<Typography variant="body2" color="textSecondary" component="p">
								{item.Description}
							</Typography>

							<Divider variant="middle" style={{ marginTop: "10px" }} />

							<List>
								{item.Comments.map((cmt) => {
									return (
										<ListItem key={cmt._id}>
											<ListItemText
												secondary={
													<React.Fragment>
														<Typography component="span" variant="body2">
															<Link to={`/profile/${cmt.PostedBy._id}`}>
																{cmt.PostedBy.Name}
															</Link>
															{" — "}{cmt.Text}
														</Typography>
													</React.Fragment>
												}
											/>
										</ListItem>
									);
								})}
							</List>

							<TextField
								label="Add a Comment"
								variant="outlined"
								multiline
								rows={2}
								value={comment}
								onChange={(e) => {
									setComment(e.target.value);
								}}
							/>
							<IconButton
								color="primary"
								aria-label="comment"
								onClick={() => makeComment(comment, item._id)}
							>
								<SendIcon />
							</IconButton>
						</CardContent>
					</Card>
				</div>
			))}
		</>
	);
};

export default Home;
