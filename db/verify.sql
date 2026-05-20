SELECT 'departments'     AS "Table", COUNT(*) AS "Rows" FROM departments     UNION ALL
SELECT 'permissions',              COUNT(*)              FROM permissions      UNION ALL
SELECT 'roles',                    COUNT(*)              FROM roles            UNION ALL
SELECT 'role_permissions',         COUNT(*)              FROM role_permissions UNION ALL
SELECT 'users',                    COUNT(*)              FROM users            UNION ALL
SELECT 'epics',                    COUNT(*)              FROM epics            UNION ALL
SELECT 'sprints',                  COUNT(*)              FROM sprints          UNION ALL
SELECT 'labels',                   COUNT(*)              FROM labels           UNION ALL
SELECT 'issues',                   COUNT(*)              FROM issues           UNION ALL
SELECT 'issue_labels',             COUNT(*)              FROM issue_labels     UNION ALL
SELECT 'issue_watchers',           COUNT(*)              FROM issue_watchers   UNION ALL
SELECT 'comments',                 COUNT(*)              FROM comments         UNION ALL
SELECT 'notifications',            COUNT(*)              FROM notifications    UNION ALL
SELECT 'todos',                    COUNT(*)              FROM todos            UNION ALL
SELECT 'history',                  COUNT(*)              FROM history
ORDER BY 1;
