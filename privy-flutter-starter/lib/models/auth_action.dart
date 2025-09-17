/// Defines the different types of authentication actions
/// that can be performed with email and SMS authentication.
sealed class AuthAction {
  const AuthAction();
}

/// Represents a login action - user is signing in for the first time
class Login extends AuthAction {
  const Login();
}

/// Represents a linking action - user is adding an account to existing profile
class Link extends AuthAction {
  const Link();
}

/// Represents an update action - user is changing existing account info
class Update extends AuthAction {
  final String currentValue;
  
  const Update(this.currentValue);
}