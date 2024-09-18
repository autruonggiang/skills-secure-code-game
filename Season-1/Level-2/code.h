// Welcome to Secure Code Game Season-1/Level-2!

// Follow the instructions below to get started:

// 1. Perform code review. Can you spot the bug?
// 2. Run tests.c to test the functionality
// 3. Run hack.c and if passing then CONGRATS!
// 4. Compare your solution with solution.c

#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <errno.h>

#define MAX_USERNAME_LEN 39
#define SETTINGS_COUNT 10
#define MAX_USERS 100
#define INVALID_USER_ID -1

int userid_next = 0;

typedef struct
{
    bool isAdmin;
    long userid;
    char username[MAX_USERNAME_LEN + 1];
    long setting[SETTINGS_COUNT];
} user_account;

user_account *accounts[MAX_USERS];

int create_user_account(bool isAdmin, const char *username)
{
    if (userid_next >= MAX_USERS)
    {
        fprintf(stderr, "the maximum number of users have been exceeded");
        return INVALID_USER_ID;
    }

    if (strlen(username) > MAX_USERNAME_LEN)
    {
        fprintf(stderr, "the username is too long");
        return INVALID_USER_ID;
    }

    user_account *ua = malloc(sizeof(user_account));
    if (ua == NULL)
    {
        fprintf(stderr, "malloc failed to allocate memory");
        accounts[userid_next] = NULL; // Ensure account slot is NULL on failure
        return INVALID_USER_ID;
    }

    ua->isAdmin = isAdmin;
    ua->userid = userid_next;
    strcpy(ua->username, username);
    memset(&ua->setting, 0, sizeof(ua->setting));
    accounts[userid_next] = ua;
    return userid_next++;
}

bool update_setting(int user_id, const char *index, const char *value)
{
    if (user_id < 0 || user_id >= MAX_USERS || accounts[user_id] == NULL)
        return false;

    errno = 0;
    char *endptr;
    long i = strtol(index, &endptr, 10);
    if (*endptr || errno != 0 || i < 0 || i >= SETTINGS_COUNT)
        return false;

    long v = strtol(value, &endptr, 10);
    if (*endptr || errno != 0)
        return false;

    accounts[user_id]->setting[i] = v;
    return true;
}

bool is_admin(int user_id)
{
    if (user_id < 0 || user_id >= MAX_USERS || accounts[user_id] == NULL)
    {
        fprintf(stderr, "invalid user id");
        return false;
    }
    return accounts[user_id]->isAdmin;
}

const char *username(int user_id)
{
    if (user_id < 0 || user_id >= MAX_USERS || accounts[user_id] == NULL)
    {
        fprintf(stderr, "invalid user id");
        return NULL;
    }

    return accounts[user_id]->username;
}