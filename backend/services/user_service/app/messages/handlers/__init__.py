from messages.handlers.on_user_created import handler_created_user


handler_map = {
    "user.created": handler_created_user,
    # add more here
}