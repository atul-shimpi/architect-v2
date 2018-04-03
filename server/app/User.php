<?php

namespace App;

use Vebto\Auth\User as VebtoUser;

/**
 * App\User
 *
 * @property int $id
 * @property string $email
 * @property string|null $password
 * @property array $permissions
 * @property int $activated
 * @property string|null $activation_code
 * @property string|null $activated_at
 * @property string|null $last_login
 * @property string|null $persist_code
 * @property string|null $reset_password_code
 * @property string|null $first_name
 * @property string|null $last_name
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property string|null $remember_token
 * @property string $avatar
 * @property string|null $language
 * @property string|null $country
 * @property string|null $timezone
 * @property int $confirmed
 * @property string|null $confirmation_code
 * @property-read string $display_name
 * @property-read bool $has_password
 * @property-read \Illuminate\Database\Eloquent\Collection|\Vebto\Groups\Group[] $groups
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection|\Illuminate\Notifications\DatabaseNotification[] $notifications
 * @property-read \Illuminate\Database\Eloquent\Collection|\Vebto\Auth\SocialProfile[] $social_profiles
 * @method static \Illuminate\Database\Eloquent\Builder|\Vebto\Auth\User compact()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereActivated($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereActivatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereActivationCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereAvatar($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereConfirmationCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereConfirmed($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereFirstName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereLanguage($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereLastLogin($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereLastName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User wherePermissions($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User wherePersistCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereResetPasswordCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereTimezone($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereUpdatedAt($value)
 * @mixin \Eloquent
 * @property string|null $stripe_id
 * @property string|null $card_brand
 * @property string|null $card_last_four
 * @property string|null $trial_ends_at
 * @property-read \Illuminate\Database\Eloquent\Collection $subscriptions
 * @property-read \Illuminate\Database\Eloquent\Collection $projects
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereCardBrand($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereCardLastFour($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereStripeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\User whereTrialEndsAt($value)
 */
class User extends VebtoUser
{
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function projects()
    {
        return $this->belongsToMany(Project::class, 'users_projects');
    }
}
