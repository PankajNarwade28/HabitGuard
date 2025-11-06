# Project Info Banner - Setup Guide

## 🎯 Overview
A beautiful project information banner that displays automatically after user login, showing:
- ✅ Project name and tagline
- ✅ Current date and time (live updates)
- ✅ Institution and department details
- ✅ Project guide information
- ✅ Team members with roles and responsibilities
- ✅ Key features of the application
- ✅ Technology stack used
- ✅ Project version and start date

## 📁 Files Created

1. **`constants/projectData.ts`** - All project information in TypeScript format (easy to edit)
2. **`data/project-info.json`** - Backup JSON file (optional, not used directly)
3. **`components/ProjectInfoBanner.tsx`** - Banner component
4. **`app/(tabs)/_layout.tsx`** - Updated to include the banner

## 🎨 Features

### Auto-Show Logic
- ✅ Shows automatically on first login
- ✅ Can be closed by user
- ✅ Won't show again for 24 hours after closing
- ✅ Responsive design for all screen sizes
- ✅ Smooth fade animation

### Live Elements
- ✅ Current date and time updates every minute
- ✅ Formatted as: "Thursday, November 7, 2024, 10:30 AM"

### Design Highlights
- ✅ Modern gradient header with purple theme
- ✅ Categorized sections with icons
- ✅ Color-coded information blocks
- ✅ Scrollable content for long lists
- ✅ Professional card-based layout
- ✅ Shadow and elevation effects

## 🔧 Customization Guide

### Step 1: Update Project Information

Edit **`constants/projectData.ts`** with your actual details:

```typescript
export const projectData = {
  projectName: "Your Project Name Here",
  tagline: "Your project tagline",
  institution: "Your Institution Name",
  department: "Your Department",
  academicYear: "2024-2025",
  ...
}
```

**Note:** The data is now in a TypeScript file for better compatibility with React Native. You can also keep the JSON file updated for backup purposes.

### Step 2: Update Guide Information

```typescript
guide: {
  name: "Dr. Your Guide Name",
  designation: "Professor/Assistant Professor/Associate Professor",
  department: "Computer Science",
  email: "guide@institution.edu"
}
```

### Step 3: Update Team Members

```typescript
teamMembers: [
  {
    name: "Your Name",
    role: "Full Stack Developer",
    rollNo: "YOUR_ROLL_NUMBER",
    responsibilities: "What you're working on",
    email: "your.email@student.edu"
  },
  // Add more team members...
]
```

### Step 4: Update Features List

```typescript
features: [
  "📱 Your Feature 1",
  "📚 Your Feature 2",
  "🎯 Your Feature 3"
]
```

### Step 5: Update Tech Stack

```typescript
techStack: {
  frontend: ["React Native", "Expo", "TypeScript"],
  backend: ["Node.js", "Express.js", "MySQL"],
  tools: ["Git", "VS Code"]
}
```

## 📱 Usage

### Banner Shows Automatically
The banner will appear:
- ✅ First time after login
- ✅ After 24 hours from last view
- ✅ With smooth fade-in animation

### User Can Control
Users can:
- ✅ Close the banner anytime
- ✅ Scroll through all information
- ✅ See live date/time updates

### Reset Banner (For Testing)

To make the banner show again immediately, run in your app:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reset banner
await AsyncStorage.removeItem('project_banner_shown');
```

Or add this to your settings page as a "View Project Info" button.

## 🎨 Customization Options

### Change Colors

In **`components/ProjectInfoBanner.tsx`**, modify:

```typescript
// Header gradient color
backgroundColor: '#667eea' // Change to your color

// Border colors
borderLeftColor: '#667eea' // Match your theme

// Button color
backgroundColor: '#667eea' // Primary action color
```

### Change Show Frequency

In **`components/ProjectInfoBanner.tsx`**, line ~30:

```typescript
if (hoursSince > 24) {  // Change 24 to your preferred hours
  setVisible(true);
}
```

### Add More Sections

You can add more sections in the TypeScript file:

```typescript
export const projectData = {
  // ... existing fields
  achievements: ["Award 1", "Award 2"],
  publications: ["Paper 1", "Paper 2"],
  funding: "Funding source details"
}
```

Then display them in the component.

## 🐛 Troubleshooting

### Banner Not Showing?
1. Check if you've logged in recently
2. Clear storage: `AsyncStorage.removeItem('project_banner_shown')`
3. Check console for errors

### Data Not Displaying?
1. Check the data in `constants/projectData.ts`
2. Verify TypeScript syntax is correct
3. Make sure all strings are properly quoted
4. Check console for errors

### Date/Time Not Updating?
- The timer updates every 60 seconds
- Check if component is still mounted

## 📊 Banner Sections Breakdown

1. **Header (Purple)**
   - Project icon (shield with checkmark)
   - Project name and tagline
   - Current date/time (live)

2. **Description**
   - Project overview text

3. **Institution Info (Gray box)**
   - Institution name with school icon
   - Department
   - Project type and academic year badges

4. **Project Guide (Yellow box)**
   - Guide name with person icon
   - Designation and department
   - Email address

5. **Team Members (White cards)**
   - Each member in a card with:
     - Initial avatar
     - Name, role, roll number
     - Responsibilities
     - Email

6. **Key Features (Gray badges)**
   - List of features with emojis

7. **Tech Stack (Gray box)**
   - Frontend technologies
   - Backend technologies
   - Development tools

8. **Footer**
   - Version and start date
   - "Get Started" button to close

## 🚀 Advanced Features

### Add "View Project Info" Button

Add this to your settings page:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const showProjectInfo = async () => {
  await AsyncStorage.removeItem('project_banner_shown');
  // Trigger re-render or navigation
};

<TouchableOpacity onPress={showProjectInfo}>
  <Text>View Project Information</Text>
</TouchableOpacity>
```

### Track Views

Modify the banner to track how many times it's been viewed:

```typescript
const views = await AsyncStorage.getItem('banner_view_count') || '0';
await AsyncStorage.setItem('banner_view_count', String(parseInt(views) + 1));
```

## 📝 Example Data Structure

See `constants/projectData.ts` for the complete structure. Here's a minimal example:

```typescript
export const projectData = {
  projectName: "HabitGuard",
  tagline: "Your Tagline",
  guide: {
    name: "Dr. Guide Name",
    designation: "Professor"
  },
  teamMembers: [
    {
      name: "Student Name",
      role: "Developer"
    }
  ]
};
```

## 🎉 That's It!

The banner is now integrated and will show automatically after login. Customize the `constants/projectData.ts` file to match your project details!

**Important:** The project data is now in a TypeScript file (`constants/projectData.ts`) instead of JSON for better React Native compatibility.

---

**Need Help?**
- Edit `constants/projectData.ts` for all project information
- Check the TypeScript syntax
- Verify all required fields are present
- Test by removing the storage key to force show
- Check console logs for debugging
