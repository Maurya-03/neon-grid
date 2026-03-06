# Admin Portal Documentation

## Access the Admin Dashboard

### Login Credentials (Hardcoded)

- **URL:** `http://localhost:8080/admin`
- **Username:** `admin`
- **Password:** `NeonGrid2025!`

### Features Available

#### 🏠 Dashboard Overview

- **Total Rooms** - Count of all chat rooms
- **Active Users** - Sum of users currently in rooms
- **Recent Messages** - Count of latest messages across all rooms

#### 🏢 Room Management

- **View All Rooms** - List of all created chat rooms
- **Search Rooms** - Filter rooms by name or description
- **Lock/Unlock Rooms** - Prevent/allow new messages
- **Delete Rooms** - Permanently remove rooms and all messages
- **Room Details** - Created by, creation date, active users

#### 💬 Message Monitoring

- **Recent Messages** - Latest messages across all rooms
- **Message Details** - Sender, timestamp, content
- **Flag Messages** - Mark problematic content (coming soon)
- **Delete Messages** - Remove inappropriate messages (coming soon)

#### 👥 User Management (Coming Soon)

- View all registered users
- User activity monitoring
- Ban/unban users

#### 🖼️ Media Management (Coming Soon)

- View uploaded media files
- Delete inappropriate content
- Storage usage monitoring

#### ⚙️ Settings (Coming Soon)

- System configuration
- Admin preferences
- Security settings

## Technical Implementation

### Authentication

- Uses localStorage for session management
- 24-hour session duration
- Hardcoded credentials (no database required)
- Protected routes with automatic redirect

### Data Integration

- Connected to real Firebase Firestore
- Real-time room and message data
- Proper error handling and loading states
- Toast notifications for actions

### Security

- Admin-only routes protected
- Confirmation dialogs for destructive actions
- Session expiration handling

## Usage Tips

1. **Navigate** using the left sidebar tabs
2. **Refresh** data using the refresh buttons
3. **Search** rooms using the search bar
4. **Confirm** destructive actions when prompted
5. **Monitor** the stats overview for quick insights

## Troubleshooting

### Can't Access Admin

- Check URL is exactly `/admin`
- Use correct credentials (case sensitive)
- Clear browser cache if needed

### Data Not Loading

- Check internet connection
- Verify Firebase is configured
- Use refresh buttons to retry

### Actions Failing

- Check browser console for errors
- Verify Firebase permissions
- Try refreshing and repeating action
