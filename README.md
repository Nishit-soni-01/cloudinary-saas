# ☁️ Cloudinary Studio

**A modern media management and processing platform built with Next.js, Cloudinary, Prisma, and PostgreSQL.**

Cloudinary Studio is a web-based creative workspace that helps users upload, organize, optimize, and transform their images and videos through a clean and intuitive dashboard.

The platform combines cloud-based media storage with powerful processing tools, making it easier to manage digital assets in one place.

---

<img width="1896" height="872" alt="image" src="https://github.com/user-attachments/assets/b2ebb7cc-84ef-4641-ba3c-2dab433b427f" />

<img width="1910" height="881" alt="image" src="https://github.com/user-attachments/assets/27d842ba-d5ad-42f5-816b-f2db05f2008e" />



## ✨ Features

### 🔐 Authentication
- Secure user authentication using Clerk.
- Protected dashboard experience.
- User account management.

### 📁 Media Library
- Upload and manage media files.
- Organize images and videos in one workspace.
- View uploaded media in a dedicated library.
- Filter media by type: All Media, Images, and Videos.
- Preview media assets.

### 🖼️ Image Studio
- Resize images.
- Compress images to optimize file sizes.
- Convert images into optimized formats.
- Maintain image quality while processing.

### 🎬 Video Studio
- Select videos from your media library.
- Preview selected videos.
- Resize videos using 720p or custom dimensions.
- Adjust compression quality.
- Convert videos to web-friendly MP4 format using H.264.
- Preview and download processed videos.

### ✂️ Background Remover
- Automatically remove image backgrounds.
- Generate transparent PNG images.
- Download processed results.

### 🧰 Tools Dashboard
- Dedicated tools workspace.
- Easy navigation between image and video processing tools.
- Responsive dashboard interface.

### 📱 Responsive UI
- Modern dark-themed interface.
- Desktop sidebar navigation.
- Mobile navigation menu.
- Responsive layouts for different screen sizes.

---


## 📸 Project Screenshots

Explore the interface and features of Cloudinary Studio through the screenshots below.

### 1. Dashboard
<img width="1907" height="862" alt="image" src="https://github.com/user-attachments/assets/5a02474a-eb8f-4fa2-8d3f-c2ad3cf3ccb2" />

<img width="1911" height="877" alt="image" src="https://github.com/user-attachments/assets/f5cbdd15-cf83-4387-87f6-f07d97224b19" />

<img width="1911" height="871" alt="image" src="https://github.com/user-attachments/assets/cf1be20d-f533-4305-b15b-f8e7f20b14a6" />

<img width="1917" height="878" alt="image" src="https://github.com/user-attachments/assets/2d64a8a5-87d8-4dc9-bdef-dbe27e04eee1" />





### 2. Tools Workspace
<!-- Add your tools page screenshot here -->
![Tools Workspace](./screenshots/tools.png)

### 3. Media Library
<!-- Add your media library screenshot here -->
![Media Library](./screenshots/media-library.png)

### 4. Image Studio
<!-- Add your image studio screenshot here -->
![Image Studio](./screenshots/image-studio.png)

### 5. Video Studio
<!-- Add your video studio screenshot here -->
![Video Studio](./screenshots/video-studio.png)

### 6. Background Remover
<!-- Add your background remover screenshot here -->
![Background Remover](./screenshots/background-remover.png)

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | React framework and application routing |
| TypeScript | Type-safe development |
| React | User interface |
| Tailwind CSS | Styling and responsive design |
| Clerk | Authentication and user management |
| Cloudinary | Cloud media storage and processing |
| Prisma ORM | Database access and management |
| PostgreSQL | Relational database |
| Lucide React | Icons |

---

## 📂 Project Structure

```text
cloudinary-studio/
│
├── app/
│   ├── api/
│   │   ├── image-upload/
│   │   │   └── route.ts
│   │   └── media/
│   │
│   ├── home/
│   │   ├── page.tsx
│   │   ├── tools/
│   │   ├── media/
│   │   ├── image-studio/
│   │   ├── video-studio/
│   │   └── background-remover/
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── dashboard-sidebar.tsx
│   ├── mobile-dashboard-nav.tsx
│   ├── media-library.tsx
│   └── ...
│
├── lib/
│   └── prisma.ts
│
├── prisma/
│   └── schema.prisma
│
├── public/
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

*Note: This is a representative structure. Your actual project may contain additional components, API routes, and utility files.*

---

## ⚙️ Getting Started

Follow these instructions to run Cloudinary Studio locally.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

Navigate into the project:

```bash
cd cloudinary-studio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# PostgreSQL Database
DATABASE_URL=

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Replace the empty values with your actual credentials.

**Where to get the credentials:**

- **Clerk:** https://clerk.com/
- **Cloudinary:** https://cloudinary.com/
- **PostgreSQL:** Use your PostgreSQL database provider or local database.

Keep your secret keys private. Never commit your `.env` file to GitHub.

### 4. Configure the database

Generate the Prisma Client:

```bash
npx prisma generate
```

For an initial database setup using your Prisma schema:

```bash
npx prisma db push
```

If your project uses Prisma migrations instead, use:

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3000
```

---

## 🗄️ Database

Cloudinary Studio uses PostgreSQL with Prisma ORM.

The database includes media models for managing uploaded assets:

- **Image** – Stores image-related media records.
- **Video** – Stores video-related media records.

Prisma provides a structured and type-safe way to interact with the database.

---

## ☁️ Cloudinary Integration

Cloudinary is used for cloud-based image storage and media management.

The application connects to Cloudinary through server-side API requests using environment-based credentials.

The image upload API handles:

1. Receiving uploaded image files.
2. Authenticating requests using Cloudinary credentials.
3. Uploading files to the Cloudinary cloud.
4. Saving media information in PostgreSQL through Prisma.
5. Handling upload and database errors.

Cloudinary credentials remain on the server and should never be exposed to the client.

---

## 🚀 Deployment

The application can be deployed using platforms that support Next.js.

A typical deployment workflow:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables.
4. Connect your production PostgreSQL database.
5. Generate and apply Prisma database changes.
6. Deploy the application.

**Deployment platform:** Vercel (recommended)

https://vercel.com/

Make sure all required environment variables are configured in your deployment platform before running the application.

---

## 🔒 Security

- Authentication handled through Clerk.
- Cloudinary API secrets stored in environment variables.
- Database access managed through Prisma.
- `.env` files excluded from version control.
- Server-side handling of sensitive upload credentials.

---

## 🎯 Project Objective

The goal of Cloudinary Studio is to build a centralized media workspace where users can store, manage, optimize, and transform their digital assets without relying on multiple disconnected tools.

The project demonstrates practical implementation of full-stack web development, authentication, database integration, cloud storage, API development, and media processing.

---

## 👨‍💻 Author

**Nishit Soni**

- GitHub: https://github.com/Nishit-soni-01/cloudinary-saas
- Application link : https://cloudinary-saas-teal.vercel.app/
- LinkedIn: https://www.linkedin.com/in/nishit-soni-in/

---

## 📄 License

This project is available under the MIT License. Add a `LICENSE` file to the repository if you intend to distribute it under that license.
