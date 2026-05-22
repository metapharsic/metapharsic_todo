# Deployment Guide: Hostinger VPS

This guide provides instructions for hosting the Metapharsic Todo application on a Hostinger VPS at the specified location: `/u01/apps/metapharisc_todo`.

## Prerequisites

1.  **Node.js & npm**: Install Node.js (v18+ recommended).
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```
2.  **PostgreSQL**: Install and set up the database.
    ```bash
    sudo apt update
    sudo apt install postgresql postgresql-contrib
    ```
3.  **PM2**: Install the process manager globally.
    ```bash
    sudo npm install -g pm2
    ```
4.  **Nginx**: For proxying requests.
    ```bash
    sudo apt install nginx
    ```

## Step 1: Prepare the Directory

Create the target directory and set permissions (replace `your_user` with your VPS username):

```bash
sudo mkdir -p /u01/apps/metapharisc_todo
sudo chown -R your_user:your_user /u01/apps/metapharisc_todo
```

## Step 2: Upload the Code

Upload your project files to `/u01/apps/metapharisc_todo` using SCP, FTP, or Git.

## Step 3: Database Setup

1.  Switch to the postgres user: `sudo -i -u postgres`
2.  Create the database: `createdb metapharsic_todo_db`
3.  Set the password for the postgres user: `psql -c "ALTER USER postgres PASSWORD 'admin';"`
4.  Import the schema:
    ```bash
    psql -d metapharsic_todo_db -f /u01/apps/metapharisc_todo/db/schema.sql
    ```
5.  Exit the postgres user: `exit`

## Step 4: Run Deployment Script

Make the script executable and run it:

```bash
chmod +x /u01/apps/metapharisc_todo/deploy.sh
/u01/apps/metapharisc_todo/deploy.sh
```

## Step 5: Configure Nginx

1.  Create a new Nginx configuration:
    ```bash
    sudo nano /etc/nginx/sites-available/todo_metapharsic
    ```
2.  Paste the content from `nginx_todo.conf` (ensure the `server_name` matches your domain).
3.  Enable the site and restart Nginx:
    ```bash
    sudo ln -s /etc/nginx/sites-available/todo_metapharsic /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## Monitoring

- View logs: `pm2 logs metapharsic-todo`
- Check status: `pm2 status`
- Stop app: `pm2 stop metapharsic-todo`
- Restart app: `pm2 restart metapharsic-todo`
